<script lang="ts">
	export let isOpen;
	export let hamburgerClick;
	export let unit = 'rem';
	export let width = 6;
	export let height = 4;
	export let lineHeight = 0.8;
	export let contain = false;
	export let lineBorderRadius = 0.4;

	// vertical line offset when isOpen === true
	$: offset = height / 2 - lineHeight / 2;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:click={hamburgerClick}
	class:isOpen
	style:width={width + unit}
	style:height={height + unit}
>
	<div
		style:height={lineHeight + unit}
		style:transform={isOpen ? `translate(0, ${offset}${unit}) rotate(45deg)` : ''}
		style:width={isOpen && contain
			? Math.sqrt(2 * Math.pow(width > height ? height : width, 2)) - lineHeight + unit
			: width + unit}
		style:border-radius={lineBorderRadius + unit}
	/>
	<div class="l" style:height={lineHeight + unit} style:border-radius={lineBorderRadius + unit} />
	<div
		style:height={lineHeight + unit}
		style:transform={isOpen ? `translate(0, -${offset}${unit}) rotate(-45deg)` : ''}
		style:width={isOpen && contain
			? Math.sqrt(2 * Math.pow(width > height ? height : width, 2)) - lineHeight + unit
			: width + unit}
		style:border-radius={lineBorderRadius + unit}
	/>
</div>

<style>
	div {
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		transition: 1s ease-in-out;
		background-color: var(--bg-hamburger);
		& div {
			margin: 0;
			width: 100%;
			transform: rotate(0deg);
			transform-origin: center;
			background-color: var(--bg-line);
		}
	}

	.isOpen div:nth-child(2) {
		opacity: 0;
	}
</style>
