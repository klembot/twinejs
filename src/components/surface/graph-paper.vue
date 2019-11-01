<template>
	<div aria-hidden :class="`graph-paper size-${size}`"></div>
</template>
<script>
import './graph-paper.less';

export default {
	name: 'graph-paper',
	props: {
		size: {
			default: 'medium',
			type: String
		}
	}
};
</script>
