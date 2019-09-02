<template>
	<button @click="onClick" :class="type">
		<font-awesome-icon :icon="icon" v-if="icon" />
		{{label}}
	</button>
</template>

<script>
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import './icon-button.less';

export default {
	components: {FontAwesomeIcon},
	methods: {
		onClick() {
			this.$emit('click');
		}
	},
	name: 'icon-button',
	props: {
		icon: String,
		label: String,
		type: String
	}
};
</script>