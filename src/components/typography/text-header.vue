<template>
	<div class="text-header"><slot></slot></div>
</template>

<script>
import './text-header.css';

export default {
	name: 'text-header',
	props: {
		level: {
			default: 2,
			type: Number
		}
	}
};
</script>
