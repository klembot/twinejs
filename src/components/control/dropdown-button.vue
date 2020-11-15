<template>
	<span class="dropdown-button">
		<hover-over
			allow-flip
			@click-away="toggleMenu"
			position="bottom"
			:visible="menuVisible"
		>
			<icon-button @click="toggleMenu" :icon="icon" :label="label" />
			<template v-slot:hover>
				<div class="dropdown-button-menu">
					<button-card>
						<slot></slot>
					</button-card>
				</div>
			</template>
		</hover-over>
	</span>
</template>

<script>
import ButtonCard from '../container/button-card';
import HoverOver from '../container/hover-over';
import IconButton from './icon-button';
import './dropdown-button.css';

export default {
	components: {ButtonCard, HoverOver, IconButton},
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
