import type { BOQItem, ProjectMetadata, RollupSummary, BOQProjectFile } from '../types/boq';
import { safeMul, safeAdd, calculateRollup } from './math';
import { isDescendant, getNextChildPath, getNextRootPath, getParentPath } from './paths';

export class BOQEngine {
    private items: Map<string, BOQItem> = new Map();
    public metadata: ProjectMetadata;

    constructor(metadata: ProjectMetadata, initialItems: BOQItem[] = []) {
        this.metadata = { ...metadata };
        this.loadItems(initialItems);
    }

    public loadItems(items: BOQItem[]): void {
        this.items.clear();
        for (let i = 0; i < items.length; i++) {
            this.items.set(items[i].id, { ...items[i] });
        }
        this.recalculateAll();
    }

    public getItem(id: string): BOQItem | undefined {
        return this.items.get(id);
    }

    public getVisibleItems(): BOQItem[] {
        const all = Array.from(this.items.values()).sort((a, b) => a.path.localeCompare(b.path));
        const collapsedPaths: string[] = [];

        for (const item of all) {
            if (item.type !== 'item' && item.isCollapsed) {
                collapsedPaths.push(item.path + '/');
            }
        }

        if (collapsedPaths.length === 0) return all;

        return all.filter((item) => {
            return !collapsedPaths.some((prefix) => item.path.startsWith(prefix));
        });
    }

    public toggleCollapse(id: string): void {
        const item = this.items.get(id);
        if (item && item.type !== 'item') {
            item.isCollapsed = !item.isCollapsed;
        }
    }

    public updateCell(id: string, field: keyof BOQItem, value: any): void {
        const item = this.items.get(id);
        if (!item) return;

        (item as any)[field] = value;

        if (field === 'quantity' || field === 'rate') {
            item.amount = safeMul(item.quantity, item.rate);
        }

        if (item.type === 'item') {
            this.recalculateAncestorsOf(item.path);
        }
    }

    public updateReferences(id: string, references: BOQItem['references']): void {
        const item = this.items.get(id);
        if (item) {
            item.references = { ...references };
        }
    }

    /**
     * Context-Aware Insertion:
     * - If target is a section: Adds child item inside it.
     * - If target is an item: Adds sibling item inside the same section.
     */
    public insertItemContextual(targetId: string | null): BOQItem {
        const allPaths = Array.from(this.items.values()).map((i) => i.path);
        let parentPath: string;

        if (!targetId) {
            // Default: under first section or create root
            const firstSection = Array.from(this.items.values()).find((i) => i.type !== 'item');
            parentPath = firstSection ? firstSection.path : '01';
        } else {
            const target = this.items.get(targetId);
            if (!target) {
                parentPath = '01';
            } else if (target.type !== 'item') {
                parentPath = target.path;
            } else {
                parentPath = getParentPath(target.path) || '01';
            }
        }

        const newPath = getNextChildPath(parentPath, allPaths);
        const newId = crypto.randomUUID();

        const newItem: BOQItem = {
            id: newId,
            path: newPath,
            type: 'item',
            wbsCode: newPath.replace(/\//g, '.'),
            description: 'New Line Item',
            unit: 'nos',
            quantity: 1,
            rate: 0,
            amount: 0,
            references: {}
        };

        this.items.set(newId, newItem);
        this.recalculateAncestorsOf(newPath);
        return newItem;
    }

    /**
     * Adds a new major division/section at the root level
     */
    public insertSectionContextual(): BOQItem {
        const allPaths = Array.from(this.items.values()).map((i) => i.path);
        const newPath = getNextRootPath(allPaths);
        const newId = crypto.randomUUID();

        const newSection: BOQItem = {
            id: newId,
            path: newPath,
            type: 'section',
            wbsCode: newPath,
            description: 'New Section / Trade',
            unit: '',
            quantity: 0,
            rate: 0,
            amount: 0,
            isCollapsed: false,
            references: {}
        };

        this.items.set(newId, newSection);
        return newSection;
    }

    public deleteItem(id: string): void {
        const target = this.items.get(id);
        if (!target) return;

        const prefix = target.path + '/';
        for (const item of this.items.values()) {
            if (item.path.startsWith(prefix)) {
                this.items.delete(item.id);
            }
        }
        this.items.delete(id);

        const parent = getParentPath(target.path);
        if (parent) {
            this.recalculateAncestorsOf(target.path);
        }
    }

    /**
     * JSON Importer: Supports Replace or Append as New Division
     */
    public importJSON(jsonData: any, mode: 'replace' | 'append'): void {
        if (mode === 'replace') {
            if (jsonData.metadata) this.metadata = { ...jsonData.metadata };
            const importedItems: BOQItem[] = jsonData.items || (Array.isArray(jsonData) ? jsonData : []);
            this.loadItems(importedItems);
        } else {
            // Append: Remap root paths so they don't collide
            const importedItems: BOQItem[] = jsonData.items || (Array.isArray(jsonData) ? jsonData : []);
            const allPaths = Array.from(this.items.values()).map((i) => i.path);
            const nextRoot = parseInt(getNextRootPath(allPaths), 10);

            // Map imported root segment to next available index
            const rootMap = new Map<string, string>();
            for (const item of importedItems) {
                const root = item.path.split('/')[0];
                if (!rootMap.has(root)) {
                    const mappedRoot = String(nextRoot + rootMap.size).padStart(2, '0');
                    rootMap.set(root, mappedRoot);
                }
            }

            for (const item of importedItems) {
                const parts = item.path.split('/');
                parts[0] = rootMap.get(parts[0]) || parts[0];
                const remappedPath = parts.join('/');

                const cloned: BOQItem = {
                    ...item,
                    id: crypto.randomUUID(),
                    path: remappedPath,
                    amount: safeMul(item.quantity, item.rate)
                };
                this.items.set(cloned.id, cloned);
            }
            this.recalculateAll();
        }
    }

    public recalculateAll(): void {
        for (const item of this.items.values()) {
            if (item.type === 'item') {
                item.amount = safeMul(item.quantity, item.rate);
            }
        }

        const nonLeafs = Array.from(this.items.values())
            .filter((i) => i.type !== 'item')
            .sort((a, b) => b.path.length - a.path.length);

        for (const section of nonLeafs) {
            let sum = 0;
            for (const item of this.items.values()) {
                if (item.type === 'item' && isDescendant(section.path, item.path)) {
                    sum = safeAdd(sum, item.amount);
                }
            }
            section.amount = sum;
        }
    }

    private recalculateAncestorsOf(childPath: string): void {
        for (const section of this.items.values()) {
            if (section.type !== 'item' && isDescendant(section.path, childPath)) {
                let sum = 0;
                for (const item of this.items.values()) {
                    if (item.type === 'item' && isDescendant(section.path, item.path)) {
                        sum = safeAdd(sum, item.amount);
                    }
                }
                section.amount = sum;
            }
        }
    }

    public getSummary(): RollupSummary {
        let directTotal = 0;
        for (const item of this.items.values()) {
            if (item.type === 'item') {
                directTotal = safeAdd(directTotal, item.amount);
            }
        }

        return calculateRollup(
            directTotal,
            this.metadata.overheadPercent,
            this.metadata.profitPercent,
            this.metadata.taxPercent
        );
    }

    public exportProjectFile(): BOQProjectFile {
        return {
            schemaVersion: '1.0.0',
            metadata: { ...this.metadata },
            items: Array.from(this.items.values()).sort((a, b) => a.path.localeCompare(b.path))
        };
    }
}