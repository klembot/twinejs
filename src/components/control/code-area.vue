<template>
	<div :class="classes">
		<label v-if="label">
			<span class="label" v-t="label" />
			<code-mirror
				@input="onChange"
				:options="codeMirrorOptions"
				:value="value"
			/>
		</label>
		<code-mirror
			class="recessed-tiny"
			@input="onChange"
			:options="codeMirrorOptions"
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
		classes() {
			return {
				'code-area': true,
				[`font-${this.font}`]: true
			};
		},
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
		font: {
			default: 'system',
			type: String,
			validator: value => ['monospace', 'system'].includes(value)
		},
		label: String,
		mode: String,
		trapTab: {default: true, type: Boolean},
		value: String
	}
};
</script>
