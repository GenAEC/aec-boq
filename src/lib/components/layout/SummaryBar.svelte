<script lang="ts">
	import type { RollupSummary } from "$lib/types/boq";

	let { summary, currency = "USD" } = $props<{
		summary: RollupSummary;
		currency?: string;
	}>();

	const fmt = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
</script>

<div
	class="bg-gray-900 text-white px-6 py-3 flex items-center justify-between font-mono text-sm border-t border-gray-800"
>
	<div class="flex gap-6">
		<div><span class="text-gray-400">Direct:</span> {currency} {fmt(summary.directTotal)}</div>
		<div><span class="text-gray-400">Overhead:</span> {currency} {fmt(summary.overheadAmount)}</div>
		<div><span class="text-gray-400">Profit:</span> {currency} {fmt(summary.profitAmount)}</div>
		<div><span class="text-gray-400">Tax:</span> {currency} {fmt(summary.taxAmount)}</div>
	</div>
	<div class="text-base font-bold text-emerald-400">
		Total: {currency}
		{fmt(summary.grandTotal)}
	</div>
</div>
