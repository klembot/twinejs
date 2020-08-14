<template>
	<div class="code-area">
		<label v-if="label">
			<span class="label" v-t="label" />
			<code-mirror
				@input="onChange"
				:options="codeMirrorOptions"
				:value="value"
			/>
		</label>
		<code-mirror
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
import './code-area.less';

export default {
	computed: {
		codeMirrorOptions() {
			const result = {mode: this.mode};

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
		label: String,
		mode: String,
		trapTab: {default: true, type: Boolean},
		value: String
	}
};
</script>
