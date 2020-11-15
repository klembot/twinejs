import {image} from 'faker';
import BaseCard from '../base-card';
import ButtonBar from '../button-bar';
import IconButton from '../../control/icon-button';

const components = {BaseCard, ButtonBar, IconButton};

export default {title: 'Container/<base-card>'};

export const contentOnly = () => ({
	components,
	template:
		'<base-card style="width: 200px"><p>This is a titleless card.</p></base-card>'
});

export const contentOnlySelected = () => ({
	components,
	template:
		'<base-card selected style="width: 200px"><p>This is a titleless card.</p></base-card>'
});

export const contentOnlyHighlighted = () => ({
	components,
	template:
		'<base-card highlighted style="width: 200px"><p>This is a titleless card.</p></base-card>'
});

export const withHeader = () => ({
	components,
	template: `<base-card style="width: 400px">
			<template v-slot:header>Card Header</template>
			<p>Content below.</p>
		</base-card>`
});

export const withHeaderSelected = () => ({
	components,
	template: `<base-card selected style="width: 400px">
			<template v-slot:header>Card Header</template>
			<p>Content below.</p>
		</base-card>`
});

export const withHeaderHighlighted = () => ({
	components,
	template: `<base-card highlighted style="width: 400px">
			<template v-slot:header>Card Header</template>
			<p>Content below.</p>
		</base-card>`
});

export const withActions = () => ({
	components,
	template: `<base-card style="width: 400px">
	<template v-slot:header>Card Header</template>
	<p>Content below.</p>
	<template v-slot:actions>
		<button-bar>
			<icon-button icon="x">Cancel</icon-button>
			<icon-button icon="check" type="primary">OK</icon-button>
		</button-bar>
	</template>
	</base-card>`
});

export const withActionsSelected = () => ({
	components,
	template: `<base-card selected style="width: 400px">
	<template v-slot:header>Card Header</template>
	<p>Content below.</p>
	<template v-slot:actions>
		<button-bar>
			<icon-button icon="x">Cancel</icon-button>
			<icon-button icon="check" type="primary">OK</icon-button>
		</button-bar>
	</template>
	</base-card>`
});

export const withImageVertical = () => ({
	components,
	template: `<base-card style="width: 200px">
		<template v-slot:image><img src="${image.image(600, 400)}" alt="" /></template>
		<template v-slot:header>Card Header</template>
		<p>Content below.</p>
		</base-card>`
});

export const withImageHorizontal = () => ({
	components,
	template: `<base-card style="width: 400px" image-position="horizontal">
		<template v-slot:image><img src="${image.image(600, 400)}" alt="" /></template>
		<template v-slot:header>Card Header</template>
		<p>Content below.</p>
		</base-card>`
});

export const withActionsHighlighted = () => ({
	components,
	template: `<base-card highlighted style="width: 400px">
	<template v-slot:header>Card Header</template>
	<p>Content below.</p>
	<template v-slot:actions>
		<button-bar>
			<icon-button icon="x">Cancel</icon-button>
			<icon-button icon="check" type="primary">OK</icon-button>
		</button-bar>
	</template>
	</base-card>`
});

export const compactContentOnly = () => ({
	components,
	template:
		'<base-card compact style="width: 100px"><p>This is a titleless card.</p></base-card>'
});

export const compactContentOnlyOverflow = () => ({
	components,
	template: `<base-card compact style="height: 100px; width: 100px">
	<p>This is a titleless card with too much content to fit into the card itself. The card should cut off this content.</p>
	</base-card>`
});

export const compactContentOnlySelected = () => ({
	components,
	template:
		'<base-card compact selected style="width: 100px"><p>This is a titleless card.</p></base-card>'
});

export const compactContentOnlyHighlighted = () => ({
	components,
	template:
		'<base-card compact highlighted style="width: 100px"><p>This is a titleless card.</p></base-card>'
});

export const compactWithHeader = () => ({
	components,
	template: `<base-card compact style="width: 100px">
			<template v-slot:header>Card Header</template>
		<p>Content below.</p>
		</base-card>`
});

export const compactWithHeaderOverflow = () => ({
	components,
	template: `<base-card compact style="height: 100px; width: 100px">
			<template v-slot:header>Card Header With Overflow Text</template>
			<p>This is a card with too much content to fit into the card itself. The card should cut off this content.</p>
		</base-card>`
});

export const compactWithHeaderSelected = () => ({
	components,
	template: `<base-card compact selected style="width: 100px">
		<template v-slot:header>Card Header</template>
		<p>Content below.</p>
		</base-card>`
});

export const compactWithHeaderHighlighted = () => ({
	components,
	template: `<base-card compact highlighted style="width: 100px">
		<template v-slot:header>Card Header</template>
		<p>Content below.</p>
		</base-card>`
});
