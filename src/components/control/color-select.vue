<template>
	<span class="color-select">
		<label>
			<span class="label"><slot></slot></span>
			<span class="control">
				<span :class="proxyClasses">
					<icon-image name="circle" />
				</span>
				<select @change="onChange" ref="select">
					<option
						v-for="color in colors"
						:key="color"
						:selected="color === value"
						:value="color"
					>
						<icon-image name="circle" />
						<span v-t="{path: `colors.${color}`}" />
					</option>
				</select>
			</span>
		</label>
	</span>
</template>

<script>
import IconImage from '../icon-image';
import './color-select.css';

const colors = ['none', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];

export default {
	components: {IconImage},
	computed: {
		colors: () => colors,
		proxyClasses() {
			return {
				proxy: true,
				[this.value]: true
			};
		}
	},
	methods: {
		onChange() {
			this.$emit('change', this.$refs.select.value);
		}
	},
	name: 'color-select',
	props: {
		value: {
			default: 'none',
			validator(value) {
				return colors.includes(value);
			}
		}
	}
};
</script>
