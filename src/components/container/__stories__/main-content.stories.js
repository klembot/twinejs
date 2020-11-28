import MainContent from '../main-content.vue';

export default {title: 'Container/<main-content>'};

export const normal = () => ({
	components: {MainContent},
	template: `<main-content title="This is Main Content">
		<p>Hello Storybook.</p>
	</main-content>`
});

export const notPadded = () => ({
	components: {MainContent},
	template: `<main-content :padded="false" title="Not Padded">
		<div style="background: linear-gradient(to bottom right, black, white); background-size: 100px 100px; width: 200vw; height: 200vh" />
	</main-content>`
});

export const overflow = () => ({
	components: {MainContent},
	template: `<main-content title="Overflow Handling">
		<div style="background: linear-gradient(to bottom right, black, white); background-size: 100px 100px; width: 200vw; height: 200vh" />
	</main-content>`
});

export const mouseScrolling = () => ({
	components: {MainContent},
	template: `<main-content title="Mouse Scrolling" mouse-scrolling>
		<p>Hold the space bar and drag the mouse to pan. You should be able to type a space into the field below.</p>
		<input type="text">
		<div style="background: linear-gradient(to bottom right, black, white); background-size: 100px 100px; width: 200vw; height: 200vh" />
	</main-content>`
});

export const autogrow = () => ({
	components: {MainContent},
	template: `<main-content :padded="false" title="Autogrow" auto-grow>
		<div style="background: linear-gradient(to right, black, white); border: 10px solid blue; width: 125vw; height: 75vw; position: absolute"></div>
	</main-content>`
});
