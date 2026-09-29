<script lang="ts">
	import type { BOQItem, ColumnKey } from "$lib/types/boq";
	import GridRow from "./GridRow.svelte";

	const COLUMNS: ColumnKey[] = ["wbsCode", "description", "unit", "quantity", "rate"];
	const ROW_HEIGHT = 34;
	const OVERSCAN = 10;

	let {
		items = [],
		focusedRowIndex = $bindable(0),
		focusedColKey = $bindable("description" as ColumnKey),
		onCellChange,
		onToggleCollapse,
		onDelete,
		onOpenInspector,
	} = $props<{
		items: BOQItem[];
		focusedRowIndex: number | null;
		focusedColKey: ColumnKey;
		onCellChange: (id: string, field: keyof BOQItem, value: any) => void;
		onToggleCollapse: (id: string) => void;
		onDelete: (id: string) => void;
		onOpenInspector: (id: string) => void;
	}>();

	let scrollContainer = $state<HTMLDivElement | null>(null);
	let scrollTop = $state(0);
	let viewportHeight = $state(600);

	let totalHeight = $derived(items.length * ROW_HEIGHT);
	let startIndex = $derived(Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN));
	let endIndex = $derived(Math.min(items.length, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN));

	let visibleRows = $derived(
		items.slice(startIndex, endIndex).map((item: BOQItem, idx: number) => ({
			item,
			index: startIndex + idx,
			top: (startIndex + idx) * ROW_HEIGHT,
		})),
	);

	function handleScroll(e: Event) {
		scrollTop = (e.currentTarget as HTMLDivElement).scrollTop;
	}

	function handleSelectCell(rowIndex: number, colKey: ColumnKey) {
		focusedRowIndex = rowIndex;
		focusedColKey = colKey;
	}

	function scrollRowIntoView(rowIndex: number) {
		if (!scrollContainer) return;
		const targetTop = rowIndex * ROW_HEIGHT;
		if (targetTop < scrollContainer.scrollTop) {
			scrollContainer.scrollTop = targetTop;
		} else if (targetTop + ROW_HEIGHT > scrollContainer.scrollTop + viewportHeight) {
			scrollContainer.scrollTop = targetTop + ROW_HEIGHT - viewportHeight;
		}
	}

	function handleNavigate(e: KeyboardEvent, currentCol: ColumnKey) {
		if (focusedRowIndex === null) return;
		const colIndex = COLUMNS.indexOf(currentCol);

		if (e.key === "Tab") {
			if (e.shiftKey) {
				if (colIndex > 0) {
					focusedColKey = COLUMNS[colIndex - 1];
				} else if (focusedRowIndex > 0) {
					focusedRowIndex -= 1;
					focusedColKey = COLUMNS[COLUMNS.length - 1];
					scrollRowIntoView(focusedRowIndex);
				}
			} else {
				if (colIndex < COLUMNS.length - 1) {
					focusedColKey = COLUMNS[colIndex + 1];
				} else if (focusedRowIndex < items.length - 1) {
					focusedRowIndex += 1;
					focusedColKey = COLUMNS[0];
					scrollRowIntoView(focusedRowIndex);
				}
			}
		} else if (e.key === "Enter") {
			if (e.shiftKey && focusedRowIndex > 0) {
				focusedRowIndex -= 1;
			} else if (!e.shiftKey && focusedRowIndex < items.length - 1) {
				focusedRowIndex += 1;
			}
			scrollRowIntoView(focusedRowIndex);
		} else if (e.key === "ArrowUp" && focusedRowIndex > 0) {
			focusedRowIndex -= 1;
			scrollRowIntoView(focusedRowIndex);
		} else if (e.key === "ArrowDown" && focusedRowIndex < items.length - 1) {
			focusedRowIndex += 1;
			scrollRowIntoView(focusedRowIndex);
		}
	}
</script>

<div class="flex flex-col h-full border border-zinc-200 bg-white rounded-md overflow-hidden shadow-xs select-none">
	<!-- Table Header -->
	<div
		class="grid grid-cols-[32px_100px_1fr_75px_95px_110px_120px_32px_32px] bg-zinc-50 border-b border-zinc-200 font-semibold text-[10px] text-zinc-500 uppercase tracking-wider py-2"
	>
		<div></div>
		<div class="px-2.5">WBS Code</div>
		<div class="px-2.5">Description</div>
		<div class="text-center">UoM</div>
		<div class="text-right px-2.5">Quantity</div>
		<div class="text-right px-2.5">Unit Rate</div>
		<div class="text-right px-2.5">Total Amount</div>
		<div class="text-center">Ref</div>
		<div></div>
	</div>

	<!-- Virtual Viewport -->
	<div
		bind:this={scrollContainer}
		bind:clientHeight={viewportHeight}
		onscroll={handleScroll}
		class="flex-1 overflow-y-auto relative outline-none"
	>
		<div style="height: {totalHeight}px; width: 100%; position: relative;">
			{#each visibleRows as { item, index, top } (item.id)}
				<div class="absolute top-0 left-0 w-full" style="height: {ROW_HEIGHT}px; transform: translateY({top}px);">
					<GridRow
						{item}
						rowIndex={index}
						isRowFocused={focusedRowIndex === index}
						activeColKey={focusedColKey}
						{onCellChange}
						{onToggleCollapse}
						{onDelete}
						onNavigate={handleNavigate}
						onSelectCell={handleSelectCell}
						{onOpenInspector}
					/>
				</div>
			{/each}
		</div>
	</div>
</div>
