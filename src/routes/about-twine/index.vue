<template>
	<div class="about-twine">
		<top-bar back-route="/" :back-label="$t('storyList.title')" />
		<main-content
			:title="
				$t('aboutTwine.title', {
					buildNumber: this.buildNumber,
					version: this.version
				})
			"
		>
			<div class="app-info">
				<p v-t="'aboutTwine.twineDescription'" />
				<p v-t="'aboutTwine.license'" />
				<p>
					<icon-link
						href="https://twinery.org/donate"
						icon="heart"
						label="aboutTwine.donateToTwine"
						raised
					/>
					<icon-link
						href="https://github.com/klembot/twinejs"
						icon="code"
						label="aboutTwine.codeRepo"
						raised
					/>
				</p>
			</div>
			<div class="credits">
				<div class="credit-group">
					<h2 v-t="'aboutTwine.codeHeader'" />
					<ul>
						<li v-for="credit in credits.code" :key="`code-${credit}`">
							{{ credit }}
						</li>
					</ul>
				</div>
				<div class="credit-group">
					<h2 v-t="'aboutTwine.localizationHeader'" />
					<ul>
						<li
							v-for="credit in credits.localizations"
							:key="`localization-${credit}`"
						>
							{{ credit }}
						</li>
					</ul>
				</div>
			</div>
		</main-content>
	</div>
</template>

<script>
import IconLink from '@/components/input/icon-link';
import TopBar from '@/components/main-layout/top-bar';
import MainContent from '@/components/main-layout/main-content';
import credits from './credits.json';
import './index.less';

export default {
	components: {IconLink, MainContent, TopBar},
	computed: {
		buildVersion() {
			return this.$store.state.appInfo.appBuildVersion;
		},
		credits: () => credits,
		version() {
			return this.$store.state.appInfo.version;
		}
	},
	name: 'about-twine'
};
</script>
