const Vue = require('vue');
const VueRouter = require('vue-router');

const LocaleView = require('../locale/view');
const StoryEditView = require('../story-edit-view');
const StoryListView = require('../story-list-view');
const WelcomeView = require('../welcome');
const { loadFormat } = require('../data/actions/story-format');
const { publishStoryWithFormat } = require('../data/publish');
const replaceUI = require('../ui/replace');
const store = require('../data/store');

Vue.use(VueRouter);

let TwineRouter = new VueRouter({
	mode: 'hash',
	routes: [
		{
			/*  We connect routes with no params directly to a component. */
			path: '/locale',
			component: LocaleView
		},
		{
			path: '/welcome',
			component: WelcomeView
		},
		{
			/*
			For routes that take data objects,
			we create shim components which provide appropriate props
			to the components that do the actual work.
			*/
			path: '/stories',
			component: {
				template:
					'<div><story-list ' +
					':previously-editing="previouslyEditing"></story-list></div>',

				components: { 'story-list': StoryListView },

				data() {
					return {
						previouslyEditing: this.$route.params
							? this.$route.params.previouslyEditing
							: ''
					};
				}
			}
		},
		{
			path: '/stories/:id',
			component: {
				template: '<div><story-edit :story-id="id"></story-edit></div>',

				components: { 'story-edit': StoryEditView },

				data() {
					return { id: this.$route.params.id };
				}
			}
		},
		{
			/*
			These routes require special handling, because we tear down our
			UI when they activate.
			*/

			path: '/stories/:id/play',
			component: {
				mounted() {
					this.$nextTick(function() {
						// code that assumes this.$el is in-document
						const state = this.$store.state;
						const story = state.story.stories.find(
							story => story.id === this.$route.params.id
						);

						loadFormat(
							this.$store,
							story.storyFormat,
							story.storyFormatVersion
						).then(format => {
							replaceUI(publishStoryWithFormat(state.appInfo, story, format));
						});
					});
				}
			}
		},
		{
			path: '/stories/:id/proof',
			component: {
				mounted() {
					this.$nextTick(function() {
						// code that assumes this.$el is in-document
						const state = this.$store.state;
						const story = state.story.stories.find(
							story => story.id === this.$route.params.id
						);

						loadFormat(
							this.$store,
							state.pref.proofingFormat.name,
							state.pref.proofingFormat.version
						).then(format => {
							replaceUI(publishStoryWithFormat(state.appInfo, story, format));
						});
					});
				}
			}
		},
		{
			path: '/stories/:id/test',
			component: {
				mounted() {
					this.$nextTick(function() {
						// code that assumes this.$el is in-document
						const state = this.$store.state;
						const story = state.story.stories.find(
							story => story.id === this.$route.params.id
						);

						loadFormat(
							this.$store,
							story.storyFormat,
							story.storyFormatVersion
						).then(format => {
							replaceUI(
								publishStoryWithFormat(state.appInfo, story, format, ['debug'])
							);
						});
					});
				}
			}
		},
		{
			path: '/stories/:storyId/test/:passageId',
			component: {
				mounted() {
					this.$nextTick(function() {
						// code that assumes this.$el is in-document
						const state = this.$store.state;
						const story = state.story.stories.find(
							story => story.id === this.$route.params.storyId
						);

						loadFormat(
							this.$store,
							story.storyFormat,
							story.storyFormatVersion
						).then(format => {
							replaceUI(
								publishStoryWithFormat(
									state.appInfo,
									story,
									format,
									['debug'],
									this.$route.params.passageId
								)
							);
						});
					});
				}
			}
		},
		{
			/* By default, show the story list. */
			path: '*',
			redirect: '/stories'
		}
	]
});

TwineRouter.beforeEach((to, from, next) => {
	/*
	If we are moving from an edit view to a list view, give the list view the
	story that we were previously editing, so that it can display a zooming
	transition back to the story.
	*/

	if (from.path && to.path === '/stories') {
		const editingId = from.path.match('^/stories/([^/]+)$');

		if (editingId) {
			to.params.previouslyEditing = editingId[1];
		}
	}

	/*
	If the user has never used the app before, point them to the welcome view
	first. This has to come below any other logic, as calling transition.next()
	or redirect() will stop any other logic in the function.
	*/

	const welcomeSeen = store.state.pref.welcomeSeen;

	if (to.path === '/welcome' || welcomeSeen) {
		next();
	} else {
		next('/welcome');
	}
});

module.exports = TwineRouter;
