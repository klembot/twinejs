<template>
	<span class="dropdown-button">
		<anchored-paper
			allow-flip
			@click-away="toggleMenu"
			position="bottom"
			:visible="menuVisible"
		>
			<template v-slot:anchor>
				<icon-button @click="toggleMenu" :icon="icon" :label="label" />
			</template>
			<template v-slot:paper>
				<div class="dropdown-button-menu">
					<slot></slot>
				</div>
			</template>
		</anchored-paper>
	</span>
</template>

<script>
import AnchoredPaper from '../surface/anchored-paper';
import IconButton from '../input/icon-button';
import './dropdown-button.less';

export default {
	components: {AnchoredPaper, IconButton},
	data() {
		return {menuVisible: false};
	},
	methods: {
		toggleMenu() {
			this.menuVisible = !this.menuVisible;
		}
	},
	props: {
		icon: {
			required: true,
			type: String
		},
		label: {
			required: true,
			type: String
		}
	}
};
</script>
