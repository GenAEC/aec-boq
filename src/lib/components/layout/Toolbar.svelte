<script lang="ts">
	import { Plus, FolderPlus } from "lucide-svelte";

	let { hasSelection, onAddItem, onAddSection } = $props<{
		hasSelection: boolean;
		onAddItem: () => void;
		onAddSection: () => void;
	}>();
</script>

<div class="flex items-center gap-2 px-6 py-1.5 bg-white border-b border-zinc-200/80">
	<button
		onclick={onAddItem}
		class="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200/80 rounded transition-colors"
	>
		<Plus size={13} class="text-blue-600" />
		<span>{hasSelection ? "Insert Item" : "Add Item"}</span>
	</button>

	<button
		onclick={onAddSection}
		class="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200/80 rounded transition-colors"
	>
		<FolderPlus size={13} class="text-amber-600" />
		<span>New Section</span>
	</button>

	<div class="text-[11px] text-zinc-400 ml-auto font-mono flex gap-4">
		<span>[Tab] Move Cell</span>
		<span>[Enter] Move Row</span>
		<span>[💬] View Notes</span>
	</div>
</div>
