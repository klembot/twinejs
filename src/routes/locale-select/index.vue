<template>
	<div class="locale-select">
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
import ImageButton from '@/components/control/image-button';
import locales from '@/locales';
import MainContent from '@/components/container/main-content';
import TopBar from '@/components/container/top-bar';
import './index.css';

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
