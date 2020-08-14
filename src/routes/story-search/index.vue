<template>
	<div class="story-search">
		<top-bar :back-route="`/stories/${this.story.id}`" :back-label="story.name">
			<template v-slot:actions>
				<icon-button
					:active="includePassageNames"
					@click="toggleSetting('includePassageNames')"
					:icon="buttonIcon('includePassageNames')"
					label="storySearch.includePassageNames"
				/>
				<icon-button
					:active="matchCase"
					@click="toggleSetting('matchCase')"
					:icon="buttonIcon('matchCase')"
					label="storySearch.matchCase"
				/>
				<icon-button
					:active="useRegexes"
					@click="toggleSetting('useRegexes')"
					:icon="buttonIcon('useRegexes')"
					label="storySearch.useRegexes"
				/>
				<icon-button
					@click="replaceAll"
					:disabled="!canReplaceAll"
					icon="zap"
					label="storySearch.replaceAll"
					type="danger"
				/>
			</template>
		</top-bar>
		<main-content :title="$t('storySearch.title')">
			<div class="controls">
				<code-area
					@change="onChangeSearchFor"
					label="storySearch.searchFor"
					:trapTab="false"
					:value="searchFor"
				/>
				<code-area
					@change="onChangeReplaceWith"
					label="storySearch.replaceWith"
					:trapTab="false"
					:value="replaceWith"
				/>
			</div>
			<div class="results">
				<passage-search-result
					v-for="match in matchingPassages"
					@edit-passage="onEditPassage"
					:nameHighlighted="match.nameHighlighted"
					:passage="match.passage"
					:key="match.passage.name"
					@replace-in-passage="onReplaceInPassage"
					:textHighlighted="match.textHighlighted"
					:textMatches="match.textMatches"
				/>
			</div>
		</main-content>
	</div>
</template>

<script>
import CodeArea from '@/components/input/code-area';
import IconButton from '@/components/input/icon-button';
import TopBar from '@/components/main-layout/top-bar';
import MainContent from '@/components/main-layout/main-content';
import PassageSearchResult from '@/components/passage/passage-search-result';
import './index.less';

export default {
	components: {CodeArea, IconButton, MainContent, PassageSearchResult, TopBar},
	computed: {
		canReplaceAll() {
			return (
				this.searchFor !== '' &&
				this.replaceWith !== '' &&
				this.matchingPassages.length > 0
			);
		},
		matchingPassages() {
			if (this.searchFor === '') {
				return [];
			}

			return this.$store.getters['story/passagesInStoryMatchingSearch'](
				this.story.id,
				this.searchFor,
				{
					includePassageNames: this.includePassageNames,
					matchCase: this.matchCase,
					useRegexes: this.useRegexes
				}
			);
		},
		story() {
			const result = this.$store.state.story.stories.find(
				s => s.id === this.$route.params.storyId
			);

			if (!result) {
				console.warn(
					`There is no story in the data store with ID "${this.$route.params.id}".`
				);

				// TODO: show error message to user instead.
			}

			return result;
		}
	},
	data() {
		return {
			includePassageNames: false,
			matchCase: false,
			replaceWith: '',
			searchFor: '',
			useRegexes: false
		};
	},
	methods: {
		buttonIcon(name) {
			if (this[name]) {
				return 'check-square';
			} else {
				return 'square';
			}
		},
		onChangeReplaceWith(value) {
			this.replaceWith = value;
		},
		onChangeSearchFor(value) {
			this.searchFor = value;
		},
		onEditPassage(passage) {
			this.$router.push(`/stories/${this.story.id}/passage/${passage.id}`);
		},
		onReplaceInPassage(passage) {
			this.$store.dispatch('story/replaceInPassage', {
				includePassageNames: this.includePassageNames,
				matchCase: this.matchCase,
				passageId: passage.id,
				replace: this.replaceWith,
				search: this.searchFor,
				storyId: this.story.id,
				useRegexes: this.useRegexes
			});
		},
		replaceAll() {
			this.$store.dispatch('story/replaceInStory', {
				includePassageNames: this.includePassageNames,
				matchCase: this.matchCase,
				replace: this.replaceWith,
				search: this.searchFor,
				storyId: this.story.id,
				useRegexes: this.useRegexes
			});
		},
		toggleSetting(name) {
			if (!['includePassageNames', 'matchCase', 'useRegexes'].includes(name)) {
				throw new Error(`Asked to toggle an unknown setting: ${name}`);
			}

			this[name] = !this[name];
		}
	},
	name: 'story-search'
};
</script>
