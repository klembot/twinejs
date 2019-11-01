/*
A Vuex module for working with stories.
*/

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

export const state = {stories: []};

export default {actions, getters, mutations, state, namespaced: true};
