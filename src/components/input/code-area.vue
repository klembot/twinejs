<template>
	<div class="code-area">
		<code-mirror @input="onChange" :options="{mode}" :value="value" />
	</div>
</template>

<script>
import {codemirror as CodeMirror} from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import './code-area.less';

export default {
	components: {CodeMirror},
	methods: {
		onChange(value) {
			this.$emit('change', value);
		}
	},
	name: 'code-area',
	props: {
		mode: String,
		value: String
	}
};
</script>
