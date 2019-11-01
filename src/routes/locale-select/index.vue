<template>
	<div class="locale-route">
		<p v-t="'localeSelect.explanation'" />
		<div class="locale-list">
			<image-button
				v-for="locale in locales"
				:key="locale.code"
				:image="locale.flag"
				:label="locale.name"
				@click="select(locale.code)"
			/>
		</div>
		<p>
			<icon-button
				icon="x"
				label="common.cancel"
				type="primary"
				@click="cancel"
			/>
		</p>
	</div>
</template>

<script>
import IconButton from '@/components/input/icon-button';
import ImageButton from '@/components/input/image-button';
import locales from '@/locales';
import './index.less';

export default {
	computed: {
		locales() {
			return locales;
		}
	},
	components: {IconButton, ImageButton},
	methods: {
		cancel() {
			this.$router.push('/');
		},
		select(locale) {
			this.$store.dispatch('pref/update', {locale});
			this.$router.push('/');
		}
	},
	name: 'locale-select'
};
</script>
