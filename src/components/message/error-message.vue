<template>
	<div class="error-message">
		<icon-image name="alert-octagon" />
		<div class="message">
			<slot></slot>
		</div>
	</div>
</template>

<script>
import IconImage from '../icon-image';
import './error-message.css';

export default {
	components: {IconImage},
	name: 'error-message',
	props: {
		message: {type: String}
	}
};
</script>
