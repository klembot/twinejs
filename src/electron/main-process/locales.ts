import enUs from '../../../public/locales/en-US.json';
import i18next from 'i18next';
import {loadPrefs} from './prefs';

export const i18n = i18next.createInstance();

export async function initLocales() {
	console.log(`Initializing i18next without locale`);
	i18n.init({
		debug: true,
		fallbackLng: 'en-us',
		interpolation: {
			escapeValue: false
		},
		load: 'currentOnly'
	});

	console.log('Adding i18next translation resources');
	i18n.addResourceBundle('en-us', 'translation', enUs);
	i18n.addResourceBundle('en-US', 'translation', enUs);

	console.log('Getting locale preference');

	const {locale} = await loadPrefs();

	console.log(`Changing i18next language to ${locale}`);

	i18n.changeLanguage(locale);
}
