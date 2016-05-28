// The router managing the app's views.

let Vue = require('vue');
const VueRouter = require('vue-router');
const AppPref = require('../data/models/app-pref');
const LocaleView = require('../locale/view');
const Story = require('../data/models/story');
const StoryCollection = require('../data/collections/story');
const StoryFormat = require('../data/models/story-format');
const StoryEditView = require('../story-edit-view');
const StoryListView = require('../story-list-view');
const WelcomeView = require('../welcome');
const publish = require('../story-publish');

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
			template: '<div><story-list :collection="collection" ' +
				':previously-editing="previouslyEditing"></story-list></div>',

			components: { 'story-list': StoryListView },

			data() {
				return {
					collection: StoryCollection.all(),
					previouslyEditing: this.$route.params ?
						this.$route.params.previouslyEditing : ''
				};
			},
		}
	},

	'/stories/:id': {
		component: {
			template: '<div><story-edit :model="model" ' +
				':collection="collection"></story-edit></div>',

			components: { 'story-edit': StoryEditView },

			data() {
				const model = Story.withId(this.$route.params.id);

				return {
					model: model,
					collection: model.fetchPassages()
				};
			}
		},
	},

	'/stories/:id/play': {
		component: {
			ready() {
				publish.publishStory(Story.withId(this.$route.params.id));
			}
		}
	},

	// These routes require special handling, because we tear down our UI when
	// they activate.

	'/stories/:id/proof': {
		component: {
			ready() {
				const story = Story.withId(this.$route.params.id);
				const format = StoryFormat.withName(
					AppPref.withName('proofingFormat').get('value')
				);
				
				publish.publishStory(story, null, { format });
			}
		}
	},

	'/stories/:id/test': {
		component: {
			ready() {
				publish.publishStory(
					Story.withId(this.$route.params.id),
					null,
					{ formatOptions: ['debug'] }
				);
			}
		}
	},

	'/stories/:storyId/test/:passageId': {
		component: {
			ready() {
				publish.publishStory(
					Story.withId(this.$route.params.storyId),
					null,
					{
						formatOptions: ['debug'],
						startPassageId: this.$route.params.passageId
					}
				);
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

	const welcomePref = AppPref.withName('welcomeSeen', false);

	if (welcomePref.get('value') === true) {
		transition.next();
	}
	else {
		transition.redirect('/welcome');
	}
});

module.exports = TwineRouter;
