import WelcomeBlock from '../welcome-block.vue';
import {lorem} from 'faker';

export default {title: '<welcome-block>'};

const components = {WelcomeBlock};

function sampleContent(showSkip) {
	return `
		<welcome-block image="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDcyIDcyIiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItaW1hZ2UiPjxyZWN0IHg9IjkiIHk9IjkiIHdpZHRoPSI1NCIgaGVpZ2h0PSI1NCIgcng9IjYiIHJ5PSI2Ij48L3JlY3Q+PGNpcmNsZSBjeD0iMjUuNSIgY3k9IjI1LjUiIHI9IjQuNSI+PC9jaXJjbGU+PHBvbHlsaW5lIHBvaW50cz0iNjMgNDUgNDggMzAgMTUgNjMiPjwvcG9seWxpbmU+PC9zdmc+" :showSkip="${showSkip}" title="${lorem.sentence()}">${lorem.sentences(
		5
	)}</welcome-block>
	`;
}

export const normal = () => ({
	components,
	template: sampleContent(true)
});

export const withoutSkip = () => ({
	components,
	template: sampleContent(false)
});
