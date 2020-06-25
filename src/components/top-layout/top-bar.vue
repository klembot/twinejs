<template>
	<div class="top-bar">
		<raised-paper elevation="high">
			<div class="start">
				<span class="back-link" v-if="backLabel">
					<icon-button
						@click="goBack"
						icon="arrow-left"
						raised
						type="primary"
						>{{ backLabel }}</icon-button
					>
				</span>
				<slot name="actions"></slot>
			</div>
			<div class="end">
				<slot name="status"></slot>
			</div>
		</raised-paper>
	</div>
</template>

<script>
import IconButton from '../input/icon-button';
import RaisedPaper from '../surface/raised-paper';
import './top-bar.less';

export default {
	components: {
		IconButton,
		RaisedPaper
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
