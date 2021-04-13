import * as React from 'react';
import {Story} from '@storybook/react';
import {MenuButton, MenuButtonProps} from '../menu-button';

const main = {component: MenuButton, title: 'Control/<MenuButton>'};
export default main;

const BaseTemplate: Story<MenuButtonProps> = props => <MenuButton {...props} />;

export const Base = BaseTemplate.bind({});

Base.args = {
	icon: 'more-horizontal',
	items: [
		{label: 'Unchecked', onClick: () => {}},
		{checked: true, label: 'Checked', onClick: () => {}},
		{separator: true},
		{disabled: true, label: 'Disabled', onClick: () => {}},
		{
			checked: true,
			disabled: true,
			label: 'Disabled and Disabled',
			onClick: () => {}
		}
	],
	label: 'Menu'
};
