import {t} from '@/util/i18n';

export const formatDefaults = {
	loadError: null,
	loading: false,
	name: t('store.storyFormatDefaults.name'),
	properties: null,
	version: '',
	url: '',
	userAdded: true
};

export const builtinFormats = [
	{
		name: 'Harlowe',
		url: 'story-formats/harlowe-1.2.4/format.js',
		version: '1.2.4',
		userAdded: false
	},
	{
		name: 'Harlowe',
		url: 'story-formats/harlowe-2.1.0/format.js',
		version: '2.1.0',
		userAdded: false
	},
	{
		name: 'Harlowe',
		url: 'story-formats/harlowe-3.0.2/format.js',
		version: '3.0.2',
		userAdded: false
	},
	{
		name: 'Paperthin',
		url: 'story-formats/paperthin-1.0.0/format.js',
		version: '1.0.0',
		userAdded: false
	},
	{
		name: 'Snowman',
		url: 'story-formats/snowman-1.3.0/format.js',
		version: '1.3.0',
		userAdded: false
	},
	{
		name: 'SugarCube',
		url: 'story-formats/sugarcube-1.0.35/format.js',
		version: '1.0.35',
		userAdded: false
	},
	{
		name: 'SugarCube',
		url: 'story-formats/sugarcube-2.28.2/format.js',
		version: '2.28.2',
		userAdded: false
	}
];
