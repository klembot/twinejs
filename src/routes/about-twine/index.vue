<template>
	<div class="about-twine">
		<top-bar back-route="/" :back-label="$t('storyList.title')" />
		<top-content>
			<div class="app-info">
				<h1 v-t="{path: 'aboutTwine.title', args: {buildNumber, version}}" />
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
		</top-content>
	</div>
</template>

<script>
import IconLink from '@/components/input/icon-link';
import TopBar from '@/components/top-layout/top-bar';
import TopContent from '@/components/top-layout/top-content';
import credits from './credits.json';
import './index.less';

export default {
	components: {IconLink, TopBar, TopContent},
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
