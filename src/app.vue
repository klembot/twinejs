<template>
	<router-view />
</template>

<script>
import Router from './routes/router';
import {i18n, setLocale} from './util/i18n';
import store from './store';

export default {
	i18n,
	store,
	router: Router,
	watch: {
		'$store.state.pref.locale': {
			handler: setLocale,
			immediate: true
		}
	}
};
</script>
