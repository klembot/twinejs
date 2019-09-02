/*
Defaults for newly-created objects.
*/

import {deviceType} from 'detect-it';
import {t} from '@/util/i18n';

export const storyDefaults = {
	name: t('Untitled Story'),
	startPassage: -1,
	zoom: 1,
	snapToGrid: false,
	stylesheet: '',
	script: '',
	storyFormat: '',
	storyFormatVersion: ''
};

export const passageDefaults = {
	story: -1,
	top: 0,
	left: 0,
	width: 100,
	height: 100,
	tags: [],
	name: t('Untitled Passage'),
	selected: false,
	text:
		deviceType === 'touchOnly'
			? t('Tap this passage, then the pencil icon to edit it.')
			: t('Double-click this passage to edit it.')
};
