<template>
	<span class="menu-button" ref="container">
		<icon-button
			@click="onToggleVisibility"
			:icon="icon"
			:icon-position="iconPosition"
			:label="label"
			:label-variant="labelVariant"
		/>
		<portal>
			<div
				class="menu-button-menu"
				ref="menu"
				:style="{display: menuVisible ? 'block' : 'none'}"
			>
				<dropdown-menu><slot></slot></dropdown-menu>
			</div>
		</portal>
	</span>
</template>

<script>
import domEvents from '@/util/vue-dom-mixin';
import Popper from 'popper.js';
import DropdownMenu from './dropdown-menu';
import IconButton from '../input/icon-button';
import {Portal} from '@linusborg/vue-simple-portal';
import './menu-button.less';

export default {
	beforeDestroy() {
		if (this.popper) {
			this.popper.destroy();
		}
	},
	components: {DropdownMenu, IconButton, Portal},
	data: () => ({
		bodyListener: null,
		menuVisible: false,
		popper: null
	}),
	methods: {
		onToggleVisibility() {
			this.menuVisible = !this.menuVisible;

			if (this.menuVisible && !this.popper) {
				this.popper = new Popper(this.$refs.container, this.$refs.menu, {
					placement: `${this.menuPosition}-start`,
					strategy: 'fixed'
				});
			}

			/*
			this.$nextTick() doesn't seem to do the job correctly.
			*/

			window.setTimeout(() => this.popper.update(), 0);

			if (this.menuVisible) {
				this.bodyListener = () => {
					// TODO: hide if event target is not $refs.container or a
					// child of that.
				};
			}
		}
	},
	mounted() {
		this.on(document.body, 'click', event => {
			if (this.menuVisible) {
				let target = event.target;

				while (target) {
					if (target === this.$el) {
						return;
					}

					target = target.parentElement;
				}

				this.menuVisible = !this.menuVisible;
			}
		});
	},
	mixins: [domEvents],
	name: 'menu-button',
	props: {
		icon: {
			type: String
		},
		iconPosition: {
			type: String
		},
		label: {
			type: String
		},
		labelVariant: {
			default: 'normal',
			type: String
		},
		menuPosition: {
			default: 'bottom',
			type: String
		}
	}
};
</script>
