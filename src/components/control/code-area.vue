<template>
	<div class="code-area">
		<label v-if="label">
			<span class="label" v-t="label" />
			<code-mirror
				@input="onChange"
				:options="codeMirrorOptions"
				:style="codeMirrorStyle"
				:value="value"
			/>
		</label>
		<code-mirror
			class="recessed-tiny"
			@input="onChange"
			:options="codeMirrorOptions"
			:style="codeMirrorStyle"
			:value="value"
			v-else
		/>
	</div>
</template>

<script>
import {codemirror as CodeMirror} from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import './code-area.css';

export default {
	computed: {
		codeMirrorOptions() {
			const result = {lineWrapping: true, mode: this.mode};

			// See https://github.com/codemirror/CodeMirror/issues/5444

			if (!this.trapTab) {
				result.extraKeys = {
					Tab: false,
					'Shift-Tab': false
				};
			}

			return result;
		},
		codeMirrorStyle() {
			return {
				fontFamily: this.fontFamily.startsWith('var(')
					? this.fontFamily
					: `"${this.fontFamily}"`,
				fontSize:
					this.fontScale === -1
						? 'calc(100% + 1vw)'
						: `${this.fontScale * 100}%`
			};
		}
	},
	components: {CodeMirror},
	methods: {
		onChange(value) {
			this.$emit('change', value);
		}
	},
	name: 'code-area',
	props: {
		fontFamily: {default: 'var(--font-system)', type: String},
		fontScale: {default: 1, type: Number},
		label: String,
		mode: String,
		trapTab: {default: true, type: Boolean},
		value: String
	}
};
</script>
