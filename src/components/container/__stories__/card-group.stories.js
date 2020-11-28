import CardGroup from '../card-group';
import BaseCard from '../base-card';

export default {title: 'Container/<card-group>'};

export const columnCount = () => ({
	components: {CardGroup, BaseCard},
	template: `
	<card-group :column-count="4">
		<base-card><p>One</p></base-card>
		<base-card><p>Two</p></base-card>
		<base-card><p>Three</p></base-card>
		<base-card><p>Four</p></base-card>
		<base-card><p>Five</p></base-card>
	</card-group>
	`
});

export const columnSize = () => ({
	components: {CardGroup, BaseCard},
	template: `
	<card-group column-size="100px">
		<base-card><p>One</p></base-card>
		<base-card><p>Two</p></base-card>
		<base-card><p>Three</p></base-card>
		<base-card><p>Four</p></base-card>
		<base-card><p>Five</p></base-card>
		<base-card><p>Six</p></base-card>
		<base-card><p>Seven</p></base-card>
		<base-card><p>Eight</p></base-card>
		<base-card><p>Nine</p></base-card>
		<base-card><p>Ten</p></base-card>
	</card-group>
	`
});
