/*
Fake/mock objects for testing.
*/

import {date, internet, lorem, name, random, system} from 'faker';

export function fakeAppInfoObject(props) {
	return {
		name: lorem.words(1),
		version: system.semver(),
		buildNumber: random.number().toString(),
		...props
	};
}

export function fakePassageObject(props) {
	return {
		id: random.uuid(),
		story: -1,
		top: Math.random() * 10000,
		left: Math.random() * 10000,
		width: 100,
		height: 100,
		tags: [],
		name: lorem.words(Math.round(Math.random() * 10)),
		selected: Math.random() > 0.5,
		text: lorem.words(Math.round(Math.random() * 10)),
		...props
	};
}

export function fakeFailedStoryFormatObject(props) {
	return {
		id: random.uuid(),
		loadError: new Error(lorem.sentence()),
		loading: false,
		name: lorem.words(2),
		properties: null,
		url: '',
		version: system.semver(),
		...props
	};
}

export function fakeLoadedStoryFormatObject(props) {
	return {
		id: random.uuid(),
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
		url: internet.url(),
		version: system.semver(),
		...props
	};
}

export function fakePendingStoryFormatObject(props) {
	return {
		id: random.uuid(),
		loadError: null,
		loading: true,
		name: lorem.words(2),
		properties: null,
		url: internet.url(),
		version: system.semver(),
		...props
	};
}

export function fakeStoryObject(passageCount) {
	/* Ensure tag uniqueness. */

	const tag = lorem.word();
	const tags = [`${tag}-1`, `${tag}-2`, `${tag}-3`];

	const result = {
		tags,
		id: random.uuid(),
		lastUpdate: date.past(),
		ifid: random.uuid().toUpperCase(),
		javascript: lorem.words(Math.floor(Math.random() * 10)),
		name: lorem.words(Math.round(Math.random() * 10)),
		passages: [],
		script: lorem.words(100),
		startPassage: -1,
		storyFormat: lorem.words(Math.floor(Math.random() * 3)),
		storyFormatVersion: system.semver(),
		stylesheet: lorem.words(Math.floor(Math.random() * 10)),
		tagColors: {
			[tags[0]]: 'red',
			[tags[1]]: 'green',
			[tags[2]]: 'blue'
		},
		zoom: Math.random()
	};

	for (let i = 0; i < passageCount; i++) {
		result.passages.push(fakePassageObject({story: result.id}));
	}

	if (result.passages[0]) {
		result.startPassage = result.passages[0].id;
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
