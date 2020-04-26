<template>
	<div class="static-meter">
		<span class="filled" v-bind:style="{width: percent + '%'}"></span>
	</div>
</template>

<script>
import './index.less';

export default {
	name: 'static-meter',
	props: {
		percent: {
			required: true,
			type: Number
		}
	}
};
</script>
