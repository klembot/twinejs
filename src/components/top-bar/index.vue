<template>
	<div class="top-bar">
		<div class="start">
			<span class="back-link" v-if="backLabel">
				<icon-link :href="backHref" icon="arrow-left" type="primary">{{
					backLabel
				}}</icon-link>
			</span>
			<slot name="actions"></slot>
		</div>
		<div class="end">
			<slot name="status"></slot>
		</div>
	</div>
</template>

<script>
import IconLink from '../input/icon-link';
import './index.less';

export default {
	components: {
		IconLink
	},
	name: 'top-bar',
	props: {
		backHref: String,
		backLabel: String
	}
};
</script>
