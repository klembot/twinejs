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
 * Mappings of locale codes to flag codes, when they aren't the same.
 * @see https://flagicons.lipis.dev/
 */
export const flags = {
	ca: 'catalonia', // Special case--see src/components/image/flag.css
	cs: 'cz',
	da: 'dk',
	en: 'gb',
	ms: 'my',
	nb: 'no',
	'pt-br': 'br',
	'pt-pt': 'pt',
	sv: 'se',
	'zh-cn': 'cn'
};
