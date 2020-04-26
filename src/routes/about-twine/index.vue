<template>
	<div>
		<h2 v-t="{path: 'aboutTwine.title', args: {buildNumber, version}}" />
		<p v-t="'aboutTwine.twineDescription'" />
		<p v-t="'aboutTwine.license'" />
		<p>
			<icon-link
				href="https://twinery.org/donate"
				icon="heart"
				v-t="'aboutTwine.donateToTwine'"
			/>
			<icon-link
				href="https://github.com/klembot/twinejs"
				icon="code"
				v-t="'aboutTwine.codeRepo'"
			/>
		</p>
		<div class="credits">
			<div class="credit-group">
				<h3 v-t="'aboutTwine.codeHeader'" />
				<ul>
					<li v-for="credit in credits.code" :key="`code-${credit}`">
						{{ credit }}
					</li>
				</ul>
			</div>
			<div class="credit-group">
				<h3 v-t="'aboutTwine.localizationHeader'" />
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
		<icon-link href="" type="primary" v-t="'common.ok'" />
	</div>
</template>

<script>
import IconLink from '@/components/input/icon-link';
import credits from './credits.json';
import './index.less';

export default {
	components: {IconLink},
	computed: {
		buildVersion() {
			return this.$store.state.appInfo.appBuildVersion;
		},
		credits: () => credits,
		version() {
			return this.$store.state.appInfo.version;
		}
	}
};
</script>
