export type RowType = 'section' | 'sub-section' | 'item';
export type ColumnKey = 'wbsCode' | 'description' | 'unit' | 'quantity' | 'rate';

export interface ItemReference {
    drawingNo?: string;     // e.g. "DWG-STR-B1-002 Rev C"
    specClause?: string;    // e.g. "CSI 03 30 00 - Cl. 2.3"
    vendorQuote?: string;   // e.g. "Q-9942 (Cemex)"
    notes?: string;         // Extended engineering remarks
}

export interface BOQItem {
    id: string;
    path: string;           // e.g. "01", "01/01", "01/01/001"
    type: RowType;
    wbsCode: string;
    description: string;
    unit: string;
    quantity: number;
    rate: number;
    amount: number;         // Computed: quantity * rate
    references?: ItemReference;
    isCollapsed?: boolean;
}

export interface ProjectMetadata {
    id: string;
    title: string;
    client?: string;
    currency: string;
    revision: string;
    overheadPercent: number;
    profitPercent: number;
    taxPercent: number;
}

export interface RollupSummary {
    directTotal: number;
    overheadAmount: number;
    profitAmount: number;
    taxAmount: number;
    grandTotal: number;
}

export interface BOQProjectFile {
    schemaVersion: '1.0.0';
    metadata: ProjectMetadata;
    items: BOQItem[];
}