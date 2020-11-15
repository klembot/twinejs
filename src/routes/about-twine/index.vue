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
			<card-group column-count="1">
				<base-card>
					<p v-t="'aboutTwine.twineDescription'" />
					<p v-t="'aboutTwine.license'" />
					<template v-slot:action>
						<icon-link
							href="https://twinery.org/donate"
							icon="heart"
							label="aboutTwine.donateToTwine"
						/>
						<icon-link
							href="https://github.com/klembot/twinejs"
							icon="code"
							label="aboutTwine.codeRepo"
						/>
					</template>
				</base-card>
			</card-group>
			<card-group column-count="2">
				<base-card>
					<template v-slot:header>
						<span v-t="'aboutTwine.codeHeader'" />
					</template>
					<ul>
						<li v-for="credit in credits.code" :key="`code-${credit}`">
							{{ credit }}
						</li>
					</ul>
				</base-card>
				<base-card>
					<template v-slot:header>
						<span v-t="'aboutTwine.localizationHeader'" />
					</template>
					<ul>
						<li
							v-for="credit in credits.localizations"
							:key="`localization-${credit}`"
						>
							{{ credit }}
						</li>
					</ul>
				</base-card>
			</card-group>
		</main-content>
	</div>
</template>

<script>
import BaseCard from '@/components/container/base-card';
import CardGroup from '@/components/container/card-group';
import IconLink from '@/components/control/icon-link';
import TopBar from '@/components/container/top-bar';
import MainContent from '@/components/container/main-content';
import credits from './credits.json';
// import './index.less';

export default {
	components: {BaseCard, CardGroup, IconLink, MainContent, TopBar},
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
