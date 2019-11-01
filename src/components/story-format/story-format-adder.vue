<template>
	<div class="story-format-adder">
		<form @submit.prevent="addFormat">
			<p v-t="'components.storyFormatAdder.explanation'" />
			<p v-if="error">{{ error }}</p>
			<p>
				<input type="text" v-model="addressToAdd" />
				<icon-button
					button-type="submit"
					icon="plus"
					type="create"
					v-t="common.add"
				/>
			</p>
		</form>
	</div>
</template>

<script>
import IconButton from '../input/icon-button';

export default {
	components: {IconButton},
	data() {
		return {addressToAdd: ''};
	},
	methods: {
		addFormat() {
			this.$emit('add', this.addressToAdd);
		}
	},
	name: 'story-format-adder',
	props: {
		error: {
			required: false,
			type: String
		}
	}
};
</script>
