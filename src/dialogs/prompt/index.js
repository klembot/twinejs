/* Shows a modal dialog asking for a text response from the user. */

const Vue = require("vue");

const locale = require("../../locale");
const eventHub = require("../../common/eventHub");

require("./index.less");

const prompter = {
	component: Vue.component("prompt", {
		template: require("./index.html"),

		props: {
			buttonLabel: { type: String, default: "" },
			buttonClass: { type: String, default: "primary" },
			validator: { type: Function, default: function() {} },
			origin: { default: null },
			message: { type: String, default: "" },
			modalClass: { type: String, default: "" }
		},

		data: () => ({
			cancelLabel: '<i class="fa fa-times"></i> ' + locale.say("Cancel"),
			isValid: true,
			validationError: "",
			response: null
		}),

		mounted() {
			this.$nextTick(function() {
				// code that assumes this.$el is in-document
				this.$refs.response.focus();
				this.$refs.response.select();
			});
		},

		methods: {
			accept() {
				const validResponse = this.validator(this.response);

				if (typeof validResponse === "string") {
					this.isValid = false;
					this.validationError = validResponse;
				}
				else {
					this.isValid = true;
					eventHub.$emit("close", this.response);
				}
			},

			cancel() {
				eventHub.$emit("close");
			}
		},

		components: {
			"modal-dialog": require("../../ui/modal-dialog")
		}
	})
};

module.exports = prompter;
