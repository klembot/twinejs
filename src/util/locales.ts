/**
 * Locales supported in the app.
 * @see https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 */
export const locales = [
	{code: 'ca', name: 'Català'},
	{code: 'cs', name: 'Čeština'},
	{code: 'da', name: 'Dansk'},
	{code: 'de', name: 'Deutsch'},
	{code: 'en', name: 'English'},
	{code: 'es', name: 'Castellano'},
	{code: 'fi', name: 'Suomi'},
	{code: 'fr', name: 'Français'},
	{code: 'it', name: 'Italiano'},
	{code: 'ms', name: 'Bahasa Melayu'},
	{code: 'nb', name: 'Norsk bokmål'},
	{code: 'nl', name: 'Nederlands'},
	{code: 'pt-br', name: 'Português Brasileiro'},
	{code: 'pt-pt', name: 'Português'},
	{code: 'ru', name: 'русский'},
	{code: 'sv', name: 'Svenska'},
	{code: 'tr', name: 'Türkçe'},
	{code: 'zh-cn', name: '中文(简体)'}
];

/**
 * Finds the closest match for a locale in app-supported locales, for example
 * mapping `en-US` to `en`. If none are plausible, this returns `en` as a
 * default.
 */
export function closestAppLocale(code: string) {
	// Exact match? 

	if (locales.some(locale => locale.code === code)) {
		return code;
	}

	if (code.includes('-')) {
		const roughCode = code.replace(/-.+/, '');
		const roughMatch = locales.find(locale => locale.code === roughCode || locale.code.replace(/-.+/, '') === roughCode);

		if (roughMatch) {
			return roughMatch.code;
		}
	}

	return 'en';
}