/* A module that adds locale-oriented filters to Vue. */

import {say, sayPlural} from '../../locale';

export default {
	install(Vue) {
		Vue.filter('say', say);
		Vue.filter('sayPlural', sayPlural);
	}
};
