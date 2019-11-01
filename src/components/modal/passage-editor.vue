<template>
	<editor-modal
		:classes="['passage-editor']"
		@close="onClose"
		:id="id"
		:open="open"
	>
		<template v-slot:title>
			<text-line v-t="'editors.passage.passageName'" />
		</template>
		<template v-slot:content>
			<code-mirror v-model="editorText" />
		</template>
	</editor-modal>
</template>

<script>
import {codemirror as CodeMirror} from 'vue-codemirror';
import EditorModal from './editor-modal';
import TextLine from '../input/text-line';
import 'codemirror/lib/codemirror.css';
import './passage-editor.less';

export default {
	components: {CodeMirror, EditorModal, TextLine},
	data: () => ({
		editorName: '',
		editorText: ''
	}),
	methods: {
		onClose() {
			// TODO: check passage name uniqueness

			this.$emit('edit', this.passage.id, {
				name: this.editorName,
				text: this.editorText
			});
			this.$emit('close');
		}
	},
	props: {
		id: {
			required: true,
			type: String
		},
		open: {
			default: false,
			type: Boolean
		},
		passage: {
			type: Object
		}
	},
	watch: {
		'passage.name': function() {
			this.editorName = this.passage ? this.passage.name : '';
		},
		'passage.text': function() {
			this.editorText = this.passage ? this.passage.text : '';
		}
	}
};
</script>
