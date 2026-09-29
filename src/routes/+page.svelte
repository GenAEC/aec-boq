<script lang="ts">
	import { onMount } from "svelte";
	import { BOQEngine } from "$lib/engine/BOQEngine";
	import { exportToExcel } from "$lib/exporters/excel";
	import { saveProjectLocally, loadProjectLocally } from "$lib/storage/idb";
	import Header from "$lib/components/layout/Header.svelte";
	import Toolbar from "$lib/components/layout/Toolbar.svelte";
	import VirtualGrid from "$lib/components/grid/VirtualGrid.svelte";
	import SummaryBar from "$lib/components/layout/SummaryBar.svelte";
	import ItemInspector from "$lib/components/inspector/ItemInspector.svelte";
	import type { BOQItem, ColumnKey, ProjectMetadata } from "$lib/types/boq";

	const defaultMeta: ProjectMetadata = {
		id: "proj-master-01",
		title: "Commercial Complex - Master Package",
		currency: "USD",
		revision: "Rev 1.0",
		overheadPercent: 10,
		profitPercent: 5,
		taxPercent: 18,
	};

	const initialItems: BOQItem[] = [
		{
			id: "1",
			path: "01",
			type: "section",
			wbsCode: "01",
			description: "Concrete Works",
			unit: "",
			quantity: 0,
			rate: 0,
			amount: 0,
			isCollapsed: false,
			references: {},
		},
		{
			id: "2",
			path: "01/01",
			type: "item",
			wbsCode: "01.01",
			description: "Grade 30 Ready-Mix Concrete",
			unit: "m3",
			quantity: 150,
			rate: 120,
			amount: 0,
			references: { drawingNo: "DWG-C-01", specClause: "03 30 00" },
		},
		{
			id: "3",
			path: "01/02",
			type: "item",
			wbsCode: "01.02",
			description: "High Yield Rebar (16mm)",
			unit: "kg",
			quantity: 5000,
			rate: 2.2,
			amount: 0,
			references: { vendorQuote: "Q-491 (Arcelor)" },
		},
		{
			id: "4",
			path: "02",
			type: "section",
			wbsCode: "02",
			description: "Masonry & Partitions",
			unit: "",
			quantity: 0,
			rate: 0,
			amount: 0,
			isCollapsed: false,
			references: {},
		},
		{
			id: "5",
			path: "02/01",
			type: "item",
			wbsCode: "02.01",
			description: "200mm Autoclaved Aerated Blocks",
			unit: "m2",
			quantity: 450,
			rate: 35,
			amount: 0,
			references: {},
		},
	];
	let engine = $state.raw(new BOQEngine(defaultMeta, initialItems));

	let items = $state.raw(engine.getVisibleItems());
	let summary = $state(engine.getSummary());
	let isSaved = $state(true);

	let focusedRowIndex = $state<number | null>(0);
	let focusedColKey = $state<ColumnKey>("description");
	let selectedItemIdForInspector = $state<string | null>(null);

	let activeItemForInspector = $derived(selectedItemIdForInspector ? engine.getItem(selectedItemIdForInspector) : null);

	function syncState() {
		items = engine.getVisibleItems();
		summary = engine.getSummary();
		isSaved = false;
		saveProjectLocally(engine.exportProjectFile()).then(() => {
			isSaved = true;
		});
	}

	onMount(async () => {
		const saved = await loadProjectLocally();
		if (saved && saved.items && saved.items.length > 0) {
			engine = new BOQEngine(saved.metadata, saved.items);
			syncState();
		}
	});

	function handleCellChange(id: string, field: keyof BOQItem, value: any) {
		engine.updateCell(id, field, value);
		syncState();
	}

	function handleToggleCollapse(id: string) {
		engine.toggleCollapse(id);
		items = engine.getVisibleItems();
	}

	function handleDelete(id: string) {
		engine.deleteItem(id);
		if (selectedItemIdForInspector === id) selectedItemIdForInspector = null;
		syncState();
	}

	function handleAddItem() {
		const currentItem = focusedRowIndex !== null ? items[focusedRowIndex] : null;
		const newItem = engine.insertItemContextual(currentItem?.id || null);
		syncState();
		const newIdx = items.findIndex((i) => i.id === newItem.id);
		if (newIdx !== -1) focusedRowIndex = newIdx;
	}

	function handleAddSection() {
		engine.insertSectionContextual();
		syncState();
	}

	function handleUpdateReferences(id: string, refs: BOQItem["references"]) {
		engine.updateReferences(id, refs);
		syncState();
	}

	async function handleExportExcel() {
		const blob = await exportToExcel(engine.exportProjectFile());
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${engine.metadata.title.replace(/\s+/g, "_")}_BOQ.xlsx`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleExportJSON() {
		const project = engine.exportProjectFile();
		const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${engine.metadata.title.replace(/\s+/g, "_")}_BOQ.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleImportJSON(data: any, mode: "replace" | "append") {
		engine.importJSON(data, mode);
		syncState();
	}
</script>

<div class="flex flex-col h-screen bg-zinc-100 font-sans antialiased text-zinc-900">
	<Header
		metadata={engine.metadata}
		{isSaved}
		onExportExcel={handleExportExcel}
		onExportJSON={handleExportJSON}
		onImportJSON={handleImportJSON}
	/>

	<Toolbar hasSelection={focusedRowIndex !== null} onAddItem={handleAddItem} onAddSection={handleAddSection} />

	<div class="flex-1 flex overflow-hidden">
		<main class="flex-1 p-3 overflow-hidden">
			<VirtualGrid
				{items}
				bind:focusedRowIndex
				bind:focusedColKey
				onCellChange={handleCellChange}
				onToggleCollapse={handleToggleCollapse}
				onDelete={handleDelete}
				onOpenInspector={(id) => (selectedItemIdForInspector = id)}
			/>
		</main>

		{#if activeItemForInspector}
			<ItemInspector
				item={activeItemForInspector}
				onClose={() => (selectedItemIdForInspector = null)}
				onUpdate={handleUpdateReferences}
			/>
		{/if}
	</div>

	<footer>
		<SummaryBar {summary} currency={engine.metadata.currency} />
	</footer>
</div>
