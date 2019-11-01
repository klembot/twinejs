<template>
	<editor-modal
		:classes="['javascript-editor']"
		@close="onClose"
		:id="id"
		:open="open"
	>
		<template v-slot:title>
			<h2 v-t="'editors.storyJavaScript.dialogTitle'" />
		</template>
		<template v-slot:content>
			<p v-t="'editors.storyJavaScript.dialogExplanation'" />
			<code-mirror v-model="editorText" :options="{mode: 'javascript'}" />
		</template>
	</editor-modal>
</template>

<script>
import EditorModal from './editor-modal';
import {codemirror as CodeMirror} from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';

export default {
	components: {CodeMirror, EditorModal},
	data() {
		return {
			editorText: this.story ? this.story.script : ''
		};
	},
	methods: {
		onClose() {
			this.$emit('edit', this.editorText);
			this.$emit('close');
		}
	},
	name: 'javascript-editor',
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
		'story.script': function(value) {
			this.editorText = value;
		}
	}
};
</script>
