/**
 This is a data object to record an application-level preference.
 As much as is feasible, we store preferences at the story level.

 @class Pref
 @extends Backbone.Model
**/

'use strict';
var Backbone = require('backbone');

module.exports = Backbone.Model.extend(
{
	defaults:
	{
		name: '',
		value: null
	}
});
