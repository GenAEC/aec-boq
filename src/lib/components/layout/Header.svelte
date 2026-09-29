<script lang="ts">
	import { Download, FileSpreadsheet, Upload, CheckCircle2 } from "lucide-svelte";
	import type { ProjectMetadata } from "$lib/types/boq";

	let { metadata, isSaved, onExportExcel, onExportJSON, onImportJSON } = $props<{
		metadata: ProjectMetadata;
		isSaved: boolean;
		onExportExcel: () => void;
		onExportJSON: () => void;
		onImportJSON: (data: any, mode: "replace" | "append") => void;
	}>();

	let fileInput: HTMLInputElement;
	let showImportModal = $state(false);
	let pendingData = $state<any>(null);

	function handleFileSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const json = JSON.parse(event.target?.result as string);
				pendingData = json;
				showImportModal = true;
			} catch {
				alert("Invalid JSON file format.");
			}
		};
		reader.readAsText(file);
		fileInput.value = "";
	}

	function confirmImport(mode: "replace" | "append") {
		if (pendingData) {
			onImportJSON(pendingData, mode);
			pendingData = null;
			showImportModal = false;
		}
	}
</script>

<header class="bg-white border-b border-zinc-200 px-6 py-2.5 flex justify-between items-center shadow-2xs">
	<div class="flex items-center gap-3">
		<div class="w-2.5 h-2.5 rounded-full bg-zinc-900"></div>
		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-xs font-bold text-zinc-900 tracking-tight">{metadata.title}</h1>
				<span class="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-mono font-medium">
					{metadata.revision}
				</span>
			</div>
			<p class="text-[10px] text-zinc-400 font-mono mt-0.5">
				Master BOQ • Currency: {metadata.currency}
			</p>
		</div>
	</div>

	<div class="flex items-center gap-2">
		<!-- Local Auto-Save Indicator -->
		<div class="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono mr-2">
			<CheckCircle2 size={13} class={isSaved ? "text-emerald-500" : "text-zinc-300"} />
			<span>{isSaved ? "Saved locally" : "Syncing..."}</span>
		</div>

		<!-- Hidden Input for File Upload -->
		<input type="file" accept=".json" bind:this={fileInput} onchange={handleFileSelect} class="hidden" />

		<!-- Import JSON Button -->
		<button
			onclick={() => fileInput.click()}
			class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 rounded hover:bg-zinc-100 transition-colors"
		>
			<Upload size={12} class="text-zinc-600" />
			Load JSON
		</button>

		<!-- Export JSON Button -->
		<button
			onclick={onExportJSON}
			class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 rounded hover:bg-zinc-100 transition-colors"
		>
			<Download size={12} class="text-zinc-600" />
			Save JSON
		</button>

		<!-- Export Excel Button -->
		<button
			onclick={onExportExcel}
			class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors shadow-2xs"
		>
			<FileSpreadsheet size={12} />
			Export Excel (.xlsx)
		</button>
	</div>
</header>

<!-- JSON Import Mode Modal -->
{#if showImportModal}
	<div class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50">
		<div class="bg-white rounded-lg border border-zinc-200 p-5 max-w-sm w-full shadow-xl">
			<h3 class="text-sm font-bold text-zinc-900">Import BOQ Data</h3>
			<p class="text-xs text-zinc-500 mt-1">Choose how you would like to load this JSON data into your workspace:</p>

			<div class="mt-4 space-y-2">
				<button
					onclick={() => confirmImport("append")}
					class="w-full text-left p-3 border border-zinc-200 rounded hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
				>
					<div class="text-xs font-semibold text-zinc-900">Append as New Division</div>
					<div class="text-[11px] text-zinc-500">Adds the uploaded items as a new package below current data.</div>
				</button>

				<button
					onclick={() => confirmImport("replace")}
					class="w-full text-left p-3 border border-red-200 bg-red-50/30 rounded hover:border-red-400 hover:bg-red-50 transition-colors"
				>
					<div class="text-xs font-semibold text-red-900">Replace Current Project</div>
					<div class="text-[11px] text-red-600">Overwrites all current items and metadata with the uploaded file.</div>
				</button>
			</div>

			<div class="mt-4 flex justify-end">
				<button onclick={() => (showImportModal = false)} class="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900">
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}
