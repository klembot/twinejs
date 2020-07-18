<template>
	<div class="top-dialog" v-if="visible">
		<raised-paper elevation="high">
			<div class="top-dialog-content">
				<slot name="content"></slot>
			</div>
			<div class="top-dialog-actions">
				<slot name="actions"></slot>
			</div>
		</raised-paper>
	</div>
</template>

<script>
import RaisedPaper from '../surface/raised-paper';
import './top-dialog.less';

export default {
	components: {RaisedPaper},
	name: 'top-dialog',
	props: {
		visible: Boolean
	}
};
</script>
