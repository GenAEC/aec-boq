<script lang="ts">
	import { X, FileText, Bookmark, Hash, MessageSquare } from "lucide-svelte";
	import type { BOQItem } from "$lib/types/boq";

	let { item, onClose, onUpdate } = $props<{
		item: BOQItem;
		onClose: () => void;
		onUpdate: (id: string, references: BOQItem["references"]) => void;
	}>();

	let drawingNo = $state("");
	let specClause = $state("");
	let vendorQuote = $state("");
	let notes = $state("");

	// Dynamically sync form fields whenever the selected item changes
	$effect(() => {
		drawingNo = item.references?.drawingNo || "";
		specClause = item.references?.specClause || "";
		vendorQuote = item.references?.vendorQuote || "";
		notes = item.references?.notes || "";
	});

	function handleSave() {
		onUpdate(item.id, {
			drawingNo,
			specClause,
			vendorQuote,
			notes,
		});
	}
</script>

<div class="w-84 border-l border-zinc-200 bg-white flex flex-col h-full shadow-lg z-20">
	<div class="px-4 py-3 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
		<div class="flex items-center gap-2">
			<FileText size={15} class="text-zinc-600" />
			<span class="text-xs font-semibold text-zinc-900">Line Item References</span>
		</div>
		<button onclick={onClose} class="text-zinc-400 hover:text-zinc-700 p-1">
			<X size={15} />
		</button>
	</div>

	<div class="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
		<div>
			<span class="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Item WBS</span>
			<div class="font-bold text-zinc-800 mt-0.5">{item.wbsCode || "—"}</div>
			<div class="text-zinc-600 font-sans text-xs mt-1">{item.description}</div>
		</div>

		<hr class="border-zinc-100" />

		<div>
			<label for="drawing-input" class="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 mb-1 font-sans">
				<Bookmark size={13} class="text-blue-500" />
				Drawing Reference
			</label>
			<input
				id="drawing-input"
				type="text"
				placeholder="e.g. DWG-STR-01 Rev C"
				bind:value={drawingNo}
				oninput={handleSave}
				class="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
			/>
		</div>

		<div>
			<label for="spec-input" class="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 mb-1 font-sans">
				<Hash size={13} class="text-emerald-500" />
				Specification Clause
			</label>
			<input
				id="spec-input"
				type="text"
				placeholder="e.g. MasterFormat 03 30 00"
				bind:value={specClause}
				oninput={handleSave}
				class="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
			/>
		</div>

		<div>
			<label for="quote-input" class="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 mb-1 font-sans">
				<FileText size={13} class="text-amber-500" />
				Vendor Quote Ref
			</label>
			<input
				id="quote-input"
				type="text"
				placeholder="e.g. Quotation #Q-9942"
				bind:value={vendorQuote}
				oninput={handleSave}
				class="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
			/>
		</div>

		<div>
			<label for="remarks-input" class="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 mb-1 font-sans">
				<MessageSquare size={13} class="text-purple-500" />
				Engineering Remarks
			</label>
			<textarea
				id="remarks-input"
				rows="4"
				placeholder="Specific procurement notes, supplier clauses..."
				bind:value={notes}
				oninput={handleSave}
				class="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none font-sans"
			></textarea>
		</div>
	</div>
</div>

<div class="w-84 border-l border-zinc-200 bg-white flex flex-col h-full shadow-lg z-20">
	<div class="px-4 py-3 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
		<div class="flex items-center gap-2">
			<FileText size={15} class="text-zinc-600" />
			<span class="text-xs font-semibold text-zinc-900">Line Item References</span>
		</div>
		<button onclick={onClose} class="text-zinc-400 hover:text-zinc-700 p-1">
			<X size={15} />
		</button>
	</div>

	<div class="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
		<div>
			<span class="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Item WBS</span>
			<div class="font-bold text-zinc-800 mt-0.5">{item.wbsCode || "—"}</div>
			<div class="text-zinc-600 font-sans text-xs mt-1">{item.description}</div>
		</div>

		<hr class="border-zinc-100" />

		<div>
			<label for="drawing-input" class="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 mb-1 font-sans">
				<Bookmark size={13} class="text-blue-500" />
				Drawing Reference
			</label>
			<input
				id="drawing-input"
				type="text"
				placeholder="e.g. DWG-STR-01 Rev C"
				bind:value={drawingNo}
				oninput={handleSave}
				class="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
			/>
		</div>

		<div>
			<label for="spec-input" class="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 mb-1 font-sans">
				<Hash size={13} class="text-emerald-500" />
				Specification Clause
			</label>
			<input
				id="spec-input"
				type="text"
				placeholder="e.g. MasterFormat 03 30 00"
				bind:value={specClause}
				oninput={handleSave}
				class="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
			/>
		</div>

		<div>
			<label for="quote-input" class="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 mb-1 font-sans">
				<FileText size={13} class="text-amber-500" />
				Vendor Quote Ref
			</label>
			<input
				id="quote-input"
				type="text"
				placeholder="e.g. Quotation #Q-9942"
				bind:value={vendorQuote}
				oninput={handleSave}
				class="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
			/>
		</div>

		<div>
			<label for="remarks-input" class="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 mb-1 font-sans">
				<MessageSquare size={13} class="text-purple-500" />
				Engineering Remarks
			</label>
			<textarea
				id="remarks-input"
				rows="4"
				placeholder="Specific procurement notes, supplier clauses..."
				bind:value={notes}
				oninput={handleSave}
				class="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none font-sans"
			></textarea>
		</div>
	</div>
</div>
