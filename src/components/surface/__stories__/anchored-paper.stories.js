import AnchoredPaper from '../anchored-paper.vue';

export default {title: 'Surface/<anchored-paper>'};

export const normal = () => ({
	components: {AnchoredPaper},
	template: `
		<anchored-paper>
			<template v-slot:anchor><div style="background: blue; width: 100px; height: 100px; margin: 10px">Anchor</div></template>
			<template v-slot:content>Content</template>
		</anchored-paper>
	`
});
