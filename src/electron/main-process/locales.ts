import i18next from 'i18next';
import ca from '../../../public/locales/ca.json';
import cs from '../../../public/locales/cs.json';
import da from '../../../public/locales/da.json';
import de from '../../../public/locales/de.json';
import enUs from '../../../public/locales/en-US.json';
import es from '../../../public/locales/es.json';
import fi from '../../../public/locales/fi.json';
import fr from '../../../public/locales/fr.json';
import it from '../../../public/locales/it.json';
import jp from '../../../public/locales/jp.json';
import ms from '../../../public/locales/ms.json';
import nb from '../../../public/locales/nb.json';
import nl from '../../../public/locales/nl.json';
import ptBr from '../../../public/locales/pt-BR.json';
import ptPt from '../../../public/locales/pt-PT.json';
import ru from '../../../public/locales/ru.json';
import sl from '../../../public/locales/sl.json';
import sv from '../../../public/locales/sv.json';
import tr from '../../../public/locales/tr.json';
import uk from '../../../public/locales/uk.json';
import zhCn from '../../../public/locales/zh-CN.json';
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
	i18n.addResourceBundle('ca', 'translation', ca);
	i18n.addResourceBundle('cs', 'translation', cs);
	i18n.addResourceBundle('da', 'translation', da);
	i18n.addResourceBundle('de', 'translation', de);
	i18n.addResourceBundle('en-us', 'translation', enUs);
	i18n.addResourceBundle('en-US', 'translation', enUs);
	i18n.addResourceBundle('es', 'translation', es);
	i18n.addResourceBundle('fi', 'translation', fi);
	i18n.addResourceBundle('fr', 'translation', fr);
	i18n.addResourceBundle('it', 'translation', it);
	i18n.addResourceBundle('jp', 'translation', jp);
	i18n.addResourceBundle('ms', 'translation', ms);
	i18n.addResourceBundle('nb', 'translation', nb);
	i18n.addResourceBundle('nl', 'translation', nl);
	i18n.addResourceBundle('pt-br', 'translation', ptBr);
	i18n.addResourceBundle('pt-BR', 'translation', ptBr);
	i18n.addResourceBundle('pt-pt', 'translation', ptPt);
	i18n.addResourceBundle('pt-PT', 'translation', ptPt);
	i18n.addResourceBundle('ru', 'translation', ru);
	i18n.addResourceBundle('sl', 'translation', sl);
	i18n.addResourceBundle('sv', 'translation', sv);
	i18n.addResourceBundle('tr', 'translation', tr);
	i18n.addResourceBundle('uk', 'translation', uk);
	i18n.addResourceBundle('zh-cn', 'translation', zhCn);
	i18n.addResourceBundle('zh-CN', 'translation', zhCn);

	console.log('Getting locale preference');

	try {
		const {locale} = await loadPrefs();

		console.log(`Changing i18next language to ${locale}`);
		i18n.changeLanguage(locale);
	} catch (error) {
		console.warn("Preference couldn't be loaded, using default locale");
	}
}
