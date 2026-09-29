<script lang="ts">
	let {
		value,
		type = "text",
		align = "left",
		isFocused = false,
		onChange,
		onNavigate,
		onFocus,
	} = $props<{
		value: string | number;
		type?: "text" | "number";
		align?: "left" | "center" | "right";
		isFocused: boolean;
		onChange: (val: any) => void;
		onNavigate: (e: KeyboardEvent) => void;
		onFocus: () => void;
	}>();

	let inputRef = $state<HTMLInputElement | null>(null);

	$effect(() => {
		if (isFocused && inputRef && document.activeElement !== inputRef) {
			inputRef.focus();
		}
	});

	function handleKeyDown(e: KeyboardEvent) {
		if (["Tab", "Enter", "ArrowUp", "ArrowDown"].includes(e.key)) {
			e.preventDefault();
			onNavigate(e);
		}
	}
</script>

<div class="h-full w-full flex items-center relative {isFocused ? 'ring-1 ring-zinc-900 bg-white z-10' : ''}">
	<input
		bind:this={inputRef}
		{type}
		{value}
		onfocus={onFocus}
		onkeydown={handleKeyDown}
		oninput={(e) => {
			const target = e.currentTarget;
			onChange(type === "number" ? parseFloat(target.value) || 0 : target.value);
		}}
		class="w-full h-full bg-transparent px-2.5 py-1 focus:outline-none text-[12px] font-mono text-zinc-800 tracking-tight {align ===
		'right'
			? 'text-right'
			: align === 'center'
				? 'text-center'
				: 'text-left'}"
	/>
</div>
