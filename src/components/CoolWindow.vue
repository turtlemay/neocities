<script setup lang="ts">
const props = defineProps<{ class?: string, title: string }>();
</script>

<style>
.cool-window {

	a:link,
	a:visited {
		background: transparent;
		color: inherit;
		text-decoration: underline;
	}

	a:active {
		background: #000;
		color: #fff;
	}
}
</style>

<style scoped>
.cool-window {
	position: relative;
	display: inline-flex;
	flex-direction: column;
	box-shadow: 0px 12px 0px -6px #000;
	outline: none;
	overflow-x: hidden;
	font: 14pt var(--font-pixel-operator);
}

.title-bar {
	display: flex;
	justify-content: safe center;
	background: #f0f0f0;
	border: 1px solid #999;
	font: inherit;
	color: #444;
	text-transform: none;

	.text {
		padding: 2px 10px;
		background: #fff;
	}
}

.content-area {
	background: white;
	color: #111;
	border: 2px solid #999;
	border-top: none;
}
</style>

<template>
	<div :class="[`cool-window`, props.class]" tabindex="-1">
		<h2 class="title-bar">
			<span class="text">{{ props.title }}</span>
		</h2>
		<div class="content-area">
			<slot />
		</div>
	</div>
</template>
