<template><div></div></template>
<script>
import {publishStory} from '../../store/publish';
import replaceDom from '../../util/replace-dom';

export default {
	async mounted() {
		// TODO
		// eslint-disable-next-line no-useless-catch
		try {
			const html = await publishStory(this.$store, this.$route.params.storyId, {
				startPassage: this.$route.params.passageId,
				test: true
			});

			replaceDom(html);
		} catch (e) {
			// TODO improve handling
			// window.alert(e);
			throw e;
		}
	},
	name: 'story-test'
};
</script>
