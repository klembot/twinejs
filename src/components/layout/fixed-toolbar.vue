<template>
	<nav :class="'fixed-toolbar ' + position + ' ' + (padding ? 'with-padding' : '') + ' ' + type">
		<div class="start">
			<slot name="start"></slot>
		</div>
		<div class="middle">
			<slot name="middle"></slot>
		</div>
		<div class="end">
			<slot name="end"></slot>
		</div>
	</nav>
</template>

<script>
import './fixed-toolbar.less';

export default {
	props: {
		padding: Boolean,
		position: String,
		type: {
			default: 'raised',
			type: String
		}
	}
};
</script>