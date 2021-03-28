import enUs from '../../public/locales/en-US.json';
import i18n from '../util/i18n';

export function initLocales() {
	console.log('Adding i18next translation resources');
	i18n.addResourceBundle('en-us', 'translation', enUs);
	i18n.addResourceBundle('en-US', 'translation', enUs);
}
