<template>
	<div class="top-bar">
		<div class="start">
			<button-bar v-if="backLabel || $slots.actions">
				<span class="back-link" v-if="backLabel">
					<icon-button
						@click="goBack"
						icon="arrow-left"
						raised
						type="primary"
						>{{ backLabel }}</icon-button
					>
				</span>
				<button-bar-separator v-if="backLabel && $slots.actions" />
				<slot name="actions"></slot>
			</button-bar>
		</div>
		<div class="end">
			<slot name="status"></slot>
		</div>
	</div>
</template>

<script>
import ButtonBar from './button-bar';
import ButtonBarSeparator from './button-bar-separator';
import IconButton from '../control/icon-button';
import './top-bar.css';

export default {
	components: {
		ButtonBar,
		ButtonBarSeparator,
		IconButton
	},
	methods: {
		goBack() {
			/*
			See the router definition to see how this will be intercepted and
			transformed into a back button action where possible.
			*/

			this.$router.push(this.backRoute);
		}
	},
	name: 'top-bar',
	props: {
		backLabel: String,
		backRoute: String
	}
};
</script>
