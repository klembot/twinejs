/*
# ui/collapse

Exports simple methdos to collapse and expand content.
*/


'use strict';
var $ = require('jquery');

function toggleExpand(e) {
	$(e.target).closest('.collapseContainer').toggleClass('expanded');
}

module.exports = {
	/*
	Attaches click behavior to an element.

	@method attach
	@param {DOMElement} el parent to attach to
	@static
	*/
	attach: function(el) {
		$(el).on('click.twineui', '.collapseToggle', toggleExpand);
	},

	/*
	Detaches this behavior.

	@method detach
	@param {DOMElement} el parent to detach from
	@static
	*/
	detach: function(el) {
		$(el)off('click.twineui', '.collapseToggle', toggleExpand);
	}
};
