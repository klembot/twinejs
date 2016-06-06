// A dialog which allows a user to import a story from a file.

const Vue = require('vue');
const importer = require('../../file/importer');
const locale = require('../../locale');
const notify = require('../../ui/notify');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		working: false,
		importFile: '',
	}),

	methods: {
		close() {
			if (this.$refs.modal) {
				this.$refs.modal.close();
			}
		},

		// This usually imports the files given to its own <input> element,
		// but can also import a passed-in FileList.
		import(files) {
			const reader = new FileReader();

			this.working = true;

			reader.addEventListener('load', e => {
				importer.import(e.target.result, { confirmReplace: true }).then(
					({ count, added }) => {
						let className = '';
						let message = '';

						if (count === 0) {
							className = 'danger';
							message = locale.say(
								'Sorry, no stories could be found in this file.'
							);
						}
						else {
							// L10n: %d is a number of stories.
							message = locale.sayPlural(
								'%d story was imported.',
								'%d stories were imported.',
								added
							);
						}

						notify(message, className);
						this.close();
					},

					err => {
						notify(
							'An error occurred while trying to import this file. (' +
								err.message + ')',
							'danger'
						);
						this.close();
					});
			});

			reader.readAsText(files instanceof FileList
				? files[0]
				: this.$els.importFile.files[0], 'UTF-8');
			return reader;
		}
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog')
	}
});
