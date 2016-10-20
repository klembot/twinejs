// The router managing the app's views.

let Vue = require('vue');
const VueRouter = require('vue-router');
const LocaleView = require('../locale/view');
const StoryEditView = require('../story-edit-view');
const StoryListView = require('../story-list-view');
const WelcomeView = require('../welcome');
const { loadFormat } = require('../data/actions');
const { publishStoryWithFormat } = require('../data/publish');
const replaceUI = require('../ui/replace');
const store = require('../data/store');

Vue.use(VueRouter);

let TwineRouter = new VueRouter();

TwineRouter.map({
	// We connect routes with no params directly to a component.

	'/locale': {
		component: LocaleView
	},

	'/welcome': {
		component: WelcomeView
	},

	// For routes that take data objects, we create shim components which provide
	// appropriate props to the components that do the actual work.

	'/stories': {
		component: {
			template: '<div><story-list ' +
				':previously-editing="previouslyEditing"></story-list></div>',

			components: { 'story-list': StoryListView },

			data() {
				return {
					previouslyEditing: this.$route.params ?
						this.$route.params.previouslyEditing : ''
				};
			},
		}
	},

	'/stories/:id': {
		component: {
			template: '<div><story-edit :story-id="id"></story-edit></div>',

			components: { 'story-edit': StoryEditView },
			
			data() {
				return { id: this.$route.params.id };
			}
		},
	},

	// These routes require special handling, because we tear down our UI when
	// they activate.

	'/stories/:id/play': {
		component: {
			ready() {
				const state = this.$store.state;
				const story = state.story.stories.find(
					story => story.id === this.$route.params.id
				);

				const formatName = story.storyFormat || state.pref.defaultFormat;
				const format = state.storyFormat.formats.find(
					format => format.name === formatName
				);

				loadFormat(this.$store, formatName).then(() => {
					replaceUI(publishStoryWithFormat(
						state.appInfo,
						story,
						format
					));
				});
			}
		}
	},

	'/stories/:id/proof': {
		component: {
			ready() {
				const state = this.$store.state;
				const story = state.story.stories.find(
					story => story.id === this.$route.params.id
				);
				const format = state.storyFormat.formats.find(
					format => format.name === state.pref.proofingFormat
				);

				loadFormat(this.$store, format.name).then(() => {
					replaceUI(publishStoryWithFormat(
						state.appInfo,
						story,
						format
					));
				});
			}
		}
	},

	'/stories/:id/test': {
		component: {
			ready() {
				const state = this.$store.state;
				const story = state.story.stories.find(
					story => story.id === this.$route.params.id
				);
				const formatName = story.storyFormat || state.pref.defaultFormat;
				const format = state.storyFormat.formats.find(
					format => format.name === formatName
				);

				loadFormat(this.$store, formatName).then(() => {
					replaceUI(publishStoryWithFormat(
						state.appInfo,
						story,
						format,
						['debug']
					));
				});
			}
		}
	},

	'/stories/:storyId/test/:passageId': {
		component: {
			ready() {
				const state = this.$store.state;
				const story = state.story.stories.find(
					story => story.id === this.$route.params.storyId
				);
				const formatName = story.storyFormat || state.pref.defaultFormat;
				const format = state.storyFormat.formats.find(
					format => format.name === formatName
				);

				loadFormat(this.$store, formatName).then(() => {
					replaceUI(publishStoryWithFormat(
						state.appInfo,
						story,
						format,
						['debug'],
						this.$route.params.passageId
					));
				});
			}
		}
	}
});

// By default, show the story list.

TwineRouter.redirect({
	'*': '/stories'
});

TwineRouter.beforeEach((transition) => {
	// If we are moving from an edit view to a list view, give the list view
	// the story that we were previously editing, so that it can display a
	// zooming transition back to the story.

	if (transition.from.path && transition.to.path === '/stories') {
		const editingId =
			transition.from.path.match('^/stories/([^\/]+)$');

		if (editingId) {
			transition.to.params.previouslyEditing = editingId[1];
		}
	}

	// If the user has never used the app before, point them to the welcome
	// view first. This has to come below any other logic, as calling
	// transition.next() or redirect() will stop any other logic in the
	// function.

	const welcomeSeen = store.state.pref.welcomeSeen;

	if (transition.to.path === '/welcome' || welcomeSeen) {
		transition.next();
	}
	else {
		transition.redirect('/welcome');
	}
});

module.exports = TwineRouter;
