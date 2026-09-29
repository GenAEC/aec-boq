<script lang="ts">
	import { ChevronRight, ChevronDown, Trash2, MessageSquare } from "lucide-svelte";
	import type { BOQItem, ColumnKey } from "$lib/types/boq";
	import GridCell from "./GridCell.svelte";

	let {
		item,
		rowIndex,
		activeColKey,
		isRowFocused,
		onCellChange,
		onToggleCollapse,
		onDelete,
		onNavigate,
		onSelectCell,
		onOpenInspector,
	} = $props<{
		item: BOQItem;
		rowIndex: number;
		activeColKey: ColumnKey | null;
		isRowFocused: boolean;
		onCellChange: (id: string, field: keyof BOQItem, value: any) => void;
		onToggleCollapse: (id: string) => void;
		onDelete: (id: string) => void;
		onNavigate: (e: KeyboardEvent, colKey: ColumnKey) => void;
		onSelectCell: (rowIndex: number, colKey: ColumnKey) => void;
		onOpenInspector: (id: string) => void;
	}>();

	let isSection = $derived(item.type !== "item");
	let depth = $derived(item.path.split("/").length - 1);
	let hasNotes = $derived(
		Boolean(
			item.references?.drawingNo ||
				item.references?.specClause ||
				item.references?.vendorQuote ||
				item.references?.notes,
		),
	);
</script>

<div
	class="group grid grid-cols-[32px_100px_1fr_75px_95px_110px_120px_32px_32px] items-center h-full border-b border-zinc-200/80 text-[12px] transition-colors {isSection
		? 'bg-zinc-100/70 font-semibold text-zinc-900'
		: 'bg-white hover:bg-zinc-50/80 text-zinc-700'}"
>
	<!-- Collapse Caret -->
	<div class="flex items-center justify-center h-full border-r border-zinc-200/60">
		{#if isSection}
			<button onclick={() => onToggleCollapse(item.id)} class="p-0.5 rounded hover:bg-zinc-200 text-zinc-500">
				{#if item.isCollapsed}
					<ChevronRight size={13} />
				{:else}
					<ChevronDown size={13} />
				{/if}
			</button>
		{/if}
	</div>

	<!-- WBS Code -->
	<div class="h-full border-r border-zinc-200/60">
		<GridCell
			value={item.wbsCode}
			isFocused={isRowFocused && activeColKey === "wbsCode"}
			onChange={(v) => onCellChange(item.id, "wbsCode", v)}
			onNavigate={(e) => onNavigate(e, "wbsCode")}
			onFocus={() => onSelectCell(rowIndex, "wbsCode")}
		/>
	</div>

	<!-- Description + Guide Rail -->
	<div class="h-full border-r border-zinc-200/60 flex items-center relative" style="padding-left: {depth * 16}px;">
		{#if depth > 0}
			<div class="absolute left-2 top-0 bottom-0 w-px bg-zinc-200"></div>
		{/if}
		<GridCell
			value={item.description}
			isFocused={isRowFocused && activeColKey === "description"}
			onChange={(v) => onCellChange(item.id, "description", v)}
			onNavigate={(e) => onNavigate(e, "description")}
			onFocus={() => onSelectCell(rowIndex, "description")}
		/>
	</div>

	<!-- Unit -->
	<div class="h-full border-r border-zinc-200/60">
		{#if !isSection}
			<GridCell
				value={item.unit}
				align="center"
				isFocused={isRowFocused && activeColKey === "unit"}
				onChange={(v) => onCellChange(item.id, "unit", v)}
				onNavigate={(e) => onNavigate(e, "unit")}
				onFocus={() => onSelectCell(rowIndex, "unit")}
			/>
		{/if}
	</div>

	<!-- Quantity -->
	<div class="h-full border-r border-zinc-200/60">
		{#if !isSection}
			<GridCell
				type="number"
				align="right"
				value={item.quantity}
				isFocused={isRowFocused && activeColKey === "quantity"}
				onChange={(v) => onCellChange(item.id, "quantity", v)}
				onNavigate={(e) => onNavigate(e, "quantity")}
				onFocus={() => onSelectCell(rowIndex, "quantity")}
			/>
		{/if}
	</div>

	<!-- Rate -->
	<div class="h-full border-r border-zinc-200/60">
		{#if !isSection}
			<GridCell
				type="number"
				align="right"
				value={item.rate}
				isFocused={isRowFocused && activeColKey === "rate"}
				onChange={(v) => onCellChange(item.id, "rate", v)}
				onNavigate={(e) => onNavigate(e, "rate")}
				onFocus={() => onSelectCell(rowIndex, "rate")}
			/>
		{/if}
	</div>

	<!-- Amount -->
	<div
		class="h-full px-2.5 flex items-center justify-end font-mono text-[12px] tabular-nums font-medium text-zinc-900 border-r border-zinc-200/60"
	>
		{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
	</div>

	<!-- Inspector / Comments Trigger -->
	<div class="flex items-center justify-center h-full border-r border-zinc-200/60">
		<button
			onclick={() => onOpenInspector(item.id)}
			class="p-1 rounded transition-colors {hasNotes
				? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
				: 'text-zinc-300 hover:text-zinc-600'}"
			title="Engineering References & Notes"
		>
			<MessageSquare size={13} />
		</button>
	</div>

	<!-- Delete Row -->
	<div class="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
		<button onclick={() => onDelete(item.id)} class="text-zinc-400 hover:text-red-600 p-1 rounded" title="Delete Row">
			<Trash2 size={13} />
		</button>
	</div>
</div>
