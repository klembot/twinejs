import HoverOver from '../hover-over';

export default {title: 'Container/<hover-over>'};

export const bottom = () => ({
	components: {HoverOver},
	template: `
			<div style="margin: 100px">
				<hover-over position="bottom">
					<div style="width: 50px; height: 50px; background: green" />
					<template v-slot:hover>
						<div style="width: 150px; height: 100px; background: blue" />
					</template>
			</hover-over>
		</div>`
});

export const top = () => ({
	components: {HoverOver},
	template: `
		<div style="margin: 100px">
		<hover-over position="top">
			<div style="width: 50px; height: 50px; background: green" />
			<template v-slot:hover>
				<div style="width: 150px; height: 100px; background: blue" />
			</template>
	</hover-over>
	</div>`
});
