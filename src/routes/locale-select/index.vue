<template>
	<div class="locale-route">
		<top-bar back-route="/" :back-label="$t('storyList.title')" />
		<main-content :title="$t('common.language')">
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
		</main-content>
	</div>
</template>

<script>
import ImageButton from '@/components/input/image-button';
import locales from '@/locales';
import MainContent from '@/components/main-layout/main-content';
import TopBar from '@/components/main-layout/top-bar';
import './index.less';

export default {
	computed: {
		locales() {
			return locales;
		}
	},
	components: {ImageButton, MainContent, TopBar},
	methods: {
		select(locale) {
			this.$store.dispatch('pref/update', {locale});
			this.$router.push('/');
		}
	},
	name: 'locale-select'
};
</script>
