<template>
	<div class="locale-route">
		<p class="larger">Please choose which language you would like to use with Twine.</p>
		<div class="locale-list">
			<image-button
				v-for="locale in locales"
				:key="locale.code"
				:image="locale.flag"
				:label="locale.name"
				@click="select(locale.code)"
			></image-button>
		</div>
		<p>
			<icon-button label="Cancel" type="primary" @click="cancel"></icon-button>
		</p>
	</div>
</template>

<script>
import IconButton from '../../components/form/icon-button';
import ImageButton from '../../components/form/image-button';
import locales from '../../locales';
import './index.less';

export default {
	computed: {
		locales() {
			return locales;
		}
	},
	components: {IconButton, ImageButton},
	methods: {
		cancel() {},
		select(code) {
			console.log(`selecting ${code}`);
		}
	}
};
</script>