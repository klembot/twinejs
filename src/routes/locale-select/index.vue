<template>
	<div class="locale-route">
		<top-bar back-route="/" :back-label="$t('storyList.title')" />
		<top-content>
			<h1 v-t="'common.language'" />
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
		</top-content>
	</div>
</template>

<script>
import IconButton from '@/components/input/icon-button';
import ImageButton from '@/components/input/image-button';
import locales from '@/locales';
import TopContent from '@/components/top-layout/top-content';
import TopBar from '@/components/top-layout/top-bar';
import './index.less';

export default {
	computed: {
		locales() {
			return locales;
		}
	},
	components: {IconButton, ImageButton, TopBar, TopContent},
	methods: {
		select(locale) {
			this.$store.dispatch('pref/update', {locale});
			this.$router.push('/');
		}
	},
	name: 'locale-select'
};
</script>
