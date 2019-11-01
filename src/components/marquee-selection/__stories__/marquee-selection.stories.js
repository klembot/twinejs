import MarqueeSelection from '..';

export default {title: '<marquee-selection>'};

export const normal = () => ({
	components: {MarqueeSelection},
	template:
		'<div style="background: lightgray; height: 100vh; width: 100vw"><marquee-selection /></div>'
});
