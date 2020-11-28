<template>
	<div class="story-search">
		<top-bar :back-route="`/stories/${this.story.id}`" :back-label="story.name">
			<template v-slot:actions>
				<text-checkbox
					@change="toggleSetting('includePassageNames')"
					:checked="includePassageNames"
					label="storySearch.matchCase"
				/>
				<text-checkbox
					@change="toggleSetting('matchCase')"
					:checked="matchCase"
					label="storySearch.includePassageNames"
				/>
				<text-checkbox
					@change="toggleSetting('useRegexes')"
					:checked="useRegexes"
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
			<card-group column-width="350px">
				<passage-search-card
					v-for="match in matchingPassages"
					@edit-passage="onEditPassage"
					:nameHighlighted="match.nameHighlighted"
					:passage="match.passage"
					:key="match.passage.name"
					@replace-in-passage="onReplaceInPassage"
					:textHighlighted="match.textHighlighted"
					:textMatches="match.textMatches"
				/>
			</card-group>
		</main-content>
	</div>
</template>

<script>
import CardGroup from '@/components/container/card-group';
import CodeArea from '@/components/control/code-area';
import IconButton from '@/components/control/icon-button';
import MainContent from '@/components/container/main-content';
import PassageSearchCard from '@/components/passage/passage-search-card';
import TextCheckbox from '@/components/control/text-checkbox';
import TopBar from '@/components/container/top-bar';
import './index.css';

export default {
	components: {
		CardGroup,
		CodeArea,
		IconButton,
		MainContent,
		PassageSearchCard,
		TextCheckbox,
		TopBar
	},
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
