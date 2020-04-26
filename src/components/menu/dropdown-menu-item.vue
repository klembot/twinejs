<template>
	<div class="dropdown-menu-item">
		<div class="check" v-if="checked">
			<icon-image name="check" />
		</div>
		<slot></slot>
	</div>
</template>

<script>
import IconImage from '../icon-image';
import './dropdown-menu-item.less';

export default {
	components: {IconImage},
	name: 'dropdown-menu-item',
	props: {
		checked: {
			default: false,
			type: Boolean
		}
	}
};
</script>
