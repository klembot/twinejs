/*
A Vuex module for working with story formats.
*/

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

export const state = {addFormatError: null, formats: []};

export default {actions, getters, mutations, state, namespaced: true};
