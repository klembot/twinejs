// Handles the cog menu for a single story.

const _ = require('underscore');
const Vue = require('vue');
const { confirm } = require('../../../dialogs/confirm');
const { prompt } = require('../../../dialogs/prompt');
const locale = require('../../../locale');
const notify = require('../../../ui/notify');
const publish = require('../../../story-publish');

/* FIXME
const Passage = require('../../../data/models/passage');
*/

module.exports = Vue.extend({
	template: require('./index.html'),

	props: ['model'],

	components: {
		'drop-down': require('../../../ui/drop-down')
	},

	methods: {
		/**
		 Plays this story in a new tab.

		 @method play
		**/

		play() {
			window.open(
				'#stories/' + this.model.id + '/play',
				'twinestory_play_' + this.model.id
			);
		},

		/**
		 Tests this story in a new tab.

		 @method test
		**/

		test() {
			if (Passage.withId(this.model.get('startPassage')) === undefined) {
				notify(
					locale.say(
						'This story does not have a starting point. ' +
						'Edit this story and use the ' +
						'<i class="fa fa-rocket"></i> icon on a passage to ' +
						'set this.'
					),
					'danger'
				);
			}
			else {
				window.open(
					'#stories/' + this.model.id + '/test',
					'twinestory_test_' + this.model.id
				);
			}
		},

		/**
		 Downloads the story to a file.

		 @method publish
		**/

		publish() {
			// verify the starting point

			if (Passage.withId(this.model.get('startPassage')) === undefined) {
				notify(
					locale.say(
						'This story does not have a starting point. ' +
						'Use the <i class="fa fa-rocket"></i> icon on a ' +
						'passage to set this.'
					),
					'danger'
				);
			}
			else {
				publish.publishStory(this.model, this.model.get('name') + '.html');
			}
		},

		/**
		 Shows a confirmation before deleting the model.

		 @method confirmDelete
		**/

		delete() {
			confirm({
				message:
					locale.say(
						'Are you sure you want to delete &ldquo;%s&rdquo;? ' +
						'This cannot be undone.',
						_.escape(this.model.get('name'))
					),
				buttonLabel:
					'<i class="fa fa-trash-o"></i> ' + locale.say('Delete Forever'),
				buttonClass:
					'danger'
			})
			.then(() => this.model.destroy());
		},

		/**
		 Prompts the user for a new name for the story, then saves it.

		 @method rename
		**/

		rename() {
			prompt({
				message:
					locale.say(
						'What should &ldquo;%s&rdquo; be renamed to?',
						_.escape(this.model.get('name'))
					),
				buttonLabel:
					'<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				response:
					this.model.get('name'),
				blankTextError:
					locale.say('Please enter a name.')
			})
			.then((name) => this.model.save({ name }));
		},

		/**
		 Prompts the user for a name, then creates a duplicate version of this
		 story accordingly.

		**/

		duplicate() {
			prompt({
				message:
					locale.say('What should the duplicate be named?'),
				buttonLabel:
					'<i class="fa fa-copy"></i> ' + locale.say('Duplicate'),
				response:
					locale.say('%s Copy', this.model.get('name')),
				blankTextError:
					locale.say('Please enter a name.')
			})
			.then((name) => this.$dispatch(
				'collection-add',
				this.model.duplicate(name)
			));
		}
	}
});
