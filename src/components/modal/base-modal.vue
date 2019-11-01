<template>
	<portal v-if="open">
		<div :class="['base-modal-container', ...classes]">
			<div :class="['base-modal-overlay', ...classes]" @click="close"></div>
			<div
				v-if="open"
				:aria-labelledby="id + '-title'"
				class="base-modal"
				:id="id"
				role="dialog"
			>
				<raised-paper>
					<div
						:class="`title ${titlePadding ? 'padded' : ''}`"
						:id="id + '-title'"
					>
						<div class="consumer-title">
							<slot name="title" />
						</div>
						<div class="buttons larger">
							<slot name="title-buttons" />
							<icon-button
								aria-lable="Close"
								@click="close"
								icon="x"
								type="flat"
							/>
						</div>
					</div>
					<div :class="`content ${contentPadding ? 'padded' : ''}`">
						<slot name="content" />
					</div>
				</raised-paper>
			</div>
		</div>
	</portal>
</template>

<script>
import {Portal} from '@linusborg/vue-simple-portal';
import RaisedPaper from '../surface/raised-paper';
import IconButton from '../input/icon-button';
import './base-modal.less';

// TODO: autofocus contents
// TODO: remember focus
// TODO: allow Escape to exit
// TODO: block <body> scrolling

export default {
	components: {IconButton, Portal, RaisedPaper},
	methods: {
		close() {
			this.$emit('close');
		}
	},
	name: 'base-modal',
	props: {
		classes: {
			default: () => [],
			type: Array
		},
		contentPadding: {
			default: true,
			type: Boolean
		},
		id: {
			required: true,
			type: String
		},
		open: {
			default: false,
			type: Boolean
		},
		titlePadding: {
			default: true,
			type: Boolean
		}
	},
	watch: {
		open() {}
	}
};
</script>
