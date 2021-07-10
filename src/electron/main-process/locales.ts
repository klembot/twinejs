import enUs from '../../../public/locales/en-US.json';
import i18next from 'i18next';

export const i18n = i18next.createInstance();

export function initLocales() {
	console.log('Initializing i18next');
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
}
