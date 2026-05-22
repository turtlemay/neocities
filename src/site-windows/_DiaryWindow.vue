<script setup lang="ts">
import CoolWindow from "../components/CoolWindow.vue";
import { ref } from "vue";
import { type getDigests } from "../../entries/entries.js";
import { clamp } from "../../src/math.ts";

type IData = Awaited<ReturnType<typeof getDigests>>;

const props = defineProps<{
	data: IData,
}>();

const data = ref<IData>(props.data);
const selectIndex = ref(data.value.length - 1);

const countCurr = () => selectIndex.value + 1;
const countTotal = () => data.value.length;
const disablePrev = () => selectIndex.value === 0;
const disableNext = () => selectIndex.value === data.value.length - 1;
const goPrev = () => selectIndex.value = clamp(selectIndex.value - 1, 0, data.value.length - 1);
const goNext = () => selectIndex.value = clamp(selectIndex.value + 1, 0, data.value.length - 1);
const goFirst = () => selectIndex.value = 0;
const goLast = () => selectIndex.value = data.value.length - 1;

function getDateText(date: Date, locale = "en-US") {
	const getStr = date.toLocaleDateString.bind(date, locale);
	return {
		dayOfWeek: getStr({ weekday: "long" }),
		dateText: getStr({ year: "2-digit", month: "2-digit", day: "2-digit" }),
		year: getStr({ year: "numeric" }),
		month: getStr({ month: "short" }),
		monthDay: getStr({ day: "2-digit" }),
	};
}
</script>

<style scoped>
.window {
	width: 22em;
	padding: 1em;
}

.date {
	max-width: 100px;
	float: left;
	padding: 0 20px 10px 0;
	text-align: center;
	display: flex;
	flex-direction: column;

	.month {
		font-weight: bold;
	}

	.day {
		font-size: 2em;
		font-weight: bold;
		margin: -10px 0;
	}
}

.content {
	overflow-y: scroll;
	height: 10em;
	padding-right: 10px;

	>*:not(:last-child) {
		margin-bottom: 1em;
	}
}

.nav {
	display: flex;
	align-items: start;
	justify-content: start;
	margin: 1em 0 0;

	.count-text {
		flex: 1;
		user-select: none;

		.clickable {
			cursor: pointer;
		}
	}

	.buttons {
		display: flex;
		gap: 4px;

		button {
			background: white;
			border: 1px solid #999;
			padding: 2px 10px;
			user-select: none;
			cursor: pointer;
		}

		button[disabled] {
			color: #ccc;
			border-color: transparent;
			cursor: unset;
		}

		button:not([disabled]):active {
			filter: invert();
		}
	}
}
</style>

<template>
	<CoolWindow title="Latest Thoughts">
		<div class="window">
			<div v-for="v of [data[selectIndex]]">
				<time class="date" v-for="d of [getDateText(v.date)]" :datetime="`${v.date}`">
					<span class="month">{{ d.month }}</span>
					<span class="day">{{ d.monthDay }}</span>
					<span class="year">{{ d.year }}</span>
				</time>
				<div class="content">
					<div v-for="vv in v.values">
						{{ vv.content }}
					</div>
				</div>
			</div>
			<div class="nav">
				<div class="count-text">
					<span class="clickable" @click="goFirst()">{{ countCurr() }}</span>
					of
					<span class="clickable" @click="goLast()">{{ countTotal() }}</span>
				</div>
				<div class="buttons">
					<button class="prev" @click="goPrev()" :disabled="disablePrev()">Prev</button>
					<button class="next" @click="goNext()" :disabled="disableNext()">Next</button>
				</div>
			</div>
		</div>
	</CoolWindow>
</template>
