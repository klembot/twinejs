/*
Fake/mock objects for testing.
*/

import {date, internet, lorem, name, random, system} from 'faker';

export function fakePassageObject(props) {
	return {
		story: -1,
		top: Math.random() * 10000,
		left: Math.random() * 10000,
		width: 100,
		height: 100,
		tags: [],
		name: lorem.words(Math.round(Math.random() * 10)),
		selected: false,
		text: lorem.words(Math.round(Math.random() * 100)),
		...props
	};
}

export function fakeFailedStoryFormatObject(...props) {
	return {
		loadError: new Error(lorem.sentence()),
		loading: false,
		name: lorem.words(2),
		properties: null,
		url: '',
		version: system.semver(),
		...props
	};
}

export function fakeLoadedStoryFormatObject(...props) {
	return {
		loadError: null,
		loading: false,
		name: lorem.words(2),
		properties: {
			author: `${name.firstName()} ${name.lastName()}`,
			description: lorem.paragraph(),
			image:
				'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDcyIDcyIiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItaW1hZ2UiPjxyZWN0IHg9IjkiIHk9IjkiIHdpZHRoPSI1NCIgaGVpZ2h0PSI1NCIgcng9IjYiIHJ5PSI2Ij48L3JlY3Q+PGNpcmNsZSBjeD0iMjUuNSIgY3k9IjI1LjUiIHI9IjQuNSI+PC9jaXJjbGU+PHBvbHlsaW5lIHBvaW50cz0iNjMgNDUgNDggMzAgMTUgNjMiPjwvcG9seWxpbmU+PC9zdmc+',
			license: lorem.words(5),
			proofing: false,
			url: internet.url()
		},
		url: '',
		version: system.semver(),
		...props
	};
}

export function fakePendingStoryFormatObject(...props) {
	return {
		loadError: null,
		loading: true,
		name: lorem.words(2),
		properties: null,
		url: '',
		version: system.semver(),
		...props
	};
}

export function fakeStoryObject(passageCount) {
	const result = {
		id: random.uuid(),
		lastUpdate: date.past(),
		ifid: random.uuid().toUpperCase(),
		name: lorem.words(Math.round(Math.random() * 10)),
		passages: [],
		script: lorem.words(100),
		startPassage: -1,
		storyFormat: lorem.words(Math.floor(Math.random() * 3)),
		storyFormatVersion: system.semver(),
		stylesheet: lorem.words(100),
		tagColors: {},
		zoom: Math.random()
	};

	for (let i = 0; i < passageCount; i++) {
		result.passages.push(fakePassageObject({story: result.id}));
	}

	return result;
}

export function fakeVuexStore(overrides) {
	const formats = [fakeLoadedStoryFormatObject()];
	const stories = [fakeStoryObject(1)];
	const subscribers = [];

	stories[0].storyFormat = formats[0].name;
	stories[0].storyFormatVersion = formats[0].version;

	const result = {
		commit: jest.fn(),
		dispatch: jest.fn((type, payload) =>
			subscribers.forEach(s => s({type, payload}, result.state))
		),
		state: {
			appInfo: {
				buildNumber: 12345,
				name: 'Twine Test',
				version: '1.2.3'
			},
			pref: {},
			storyFormat: {formats},
			story: {stories}
		},
		subscribe: jest.fn(subscriber => subscribers.push(subscriber)),
		...overrides
	};

	return result;
}
