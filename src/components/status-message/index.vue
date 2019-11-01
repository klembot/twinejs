<template>
	<div :class="['status-message', type]">
		<div class="stack padded">
			<icon-image :name="icon" />
			<span class="content"><slot></slot></span>
		</div>
	</div>
</template>

<script>
import IconImage from '../icon-image';
import './index.less';

const iconMappings = {
	error: 'alert-octagon',
	info: 'info',
	success: 'check-circle',
	warning: 'alert-triangle'
};

export default {
	components: {IconImage},
	computed: {
		icon() {
			return iconMappings[this.type];
		}
	},
	name: 'status-message',
	props: {
		type: {
			default: 'info',
			validator: value =>
				['error', 'info', 'success', 'warning'].includes(value)
		}
	}
};
</script>
