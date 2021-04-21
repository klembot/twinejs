// ⚠️⚠️⚠️ This module may be used in both an Electron renderer or main process.
// This is because the main process makes use of certain modules under store/
// that also refer here. Loading locales obviously works very differently in
// these two contexts.
//
// Even more confusingly, there are *two* global instances of i18n: one for the
// Electron main process, and one for the renderer process or web context.

import i18n, {InitOptions} from 'i18next';
import HttpBackend from 'i18next-http-backend';
import {initReactI18next} from 'react-i18next';
import {isElectronMain} from './is-electron';

const commonInit: InitOptions = {
	fallbackLng: 'en-us',
	interpolation: {
		escapeValue: false
	},
	load: 'currentOnly'
};

if (isElectronMain()) {
	// Set up i18n without a backend. Code under `electron/` will manually add
	// locales.

	i18n.init({...commonInit, debug: true});
} else {
	i18n
		.use(HttpBackend)
		.use(initReactI18next)
		.init({
			...commonInit,
			debug: process.env.NODE_ENV === 'development',
			backend: {
				loadPath: `${process.env.PUBLIC_URL}/locales/{{lng}}.json`
			}
		});
}

export default i18n;
