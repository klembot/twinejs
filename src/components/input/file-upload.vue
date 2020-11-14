<template>
	<span class="file-upload">
		<input type="file" @change="onChange" ref="upload" />
	</span>
</template>

<script>
export default {
	methods: {
		onChange() {
			const reader = new FileReader();

			reader.onload = event => this.$emit('upload', event.target.result);
			reader.readAsText(this.$refs.upload.files[0], '');
		}
	},
	name: 'file-upload'
};
</script>
