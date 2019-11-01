<template>
	<editor-modal
		:classes="['stylesheet-editor']"
		@close="onClose"
		:id="id"
		:open="open"
	>
		<template v-slot:title>
			<h2 v-t="'editors.storyStylesheet.dialogTitle'" />
		</template>
		<template v-slot:content>
			<p v-t="'editors.storyStylesheet.dialogExplanation'" />
			<code-mirror v-model="editorText" :options="{mode: 'css'}" />
		</template>
	</editor-modal>
</template>

<script>
import EditorModal from './editor-modal';
import {codemirror as CodeMirror} from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/css/css';

export default {
	components: {CodeMirror, EditorModal},
	data() {
		return {
			editorText: this.story ? this.story.stylesheet : ''
		};
	},
	methods: {
		onClose() {
			this.$emit('edit', this.editorText);
			this.$emit('close');
		}
	},
	name: 'stylesheet-editor',
	props: {
		id: {
			required: true,
			type: String
		},
		open: {
			default: false,
			type: Boolean
		},
		story: {
			required: true,
			type: Object
		}
	},
	watch: {
		'story.stylesheet': function(value) {
			this.editorText = value;
		}
	}
};
</script>
