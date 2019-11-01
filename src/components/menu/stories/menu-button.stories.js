import DropdownMenuItem from '../dropdown-menu-item';
import IconButton from '../../input/icon-button';
import MenuButton from '../menu-button';

export default {title: 'Menu/<menu-button>'};

export const normal = () => ({
	components: {DropdownMenuItem, IconButton, MenuButton},
	template:
		'<menu-button icon="settings"><dropdown-menu-item><icon-button label="Red" /></dropdown-menu-item><dropdown-menu-item><icon-button label="Blue" /></dropdown-menu-item><dropdown-menu-item><icon-button label="Green" /></dropdown-menu-item></menu-button>'
});

export const above = () => ({
	components: {DropdownMenuItem, IconButton, MenuButton},
	template:
		'<div style="position: absolute; bottom: 0"><menu-button icon="settings"><dropdown-menu-item><icon-button label="Red" /></dropdown-menu-item><dropdown-menu-item><icon-button label="Blue" /></dropdown-menu-item><dropdown-menu-item><icon-button label="Green" /></dropdown-menu-item></menu-button></div>'
});

export const fixed = () => ({
	components: {DropdownMenuItem, IconButton, MenuButton},
	template:
		'<div style="position: fixed; bottom: 0; height: 50px; left: 0; right: 0; border-top: 1px solid blue"><menu-button icon="settings"><dropdown-menu-item><icon-button label="Red" /></dropdown-menu-item><dropdown-menu-item><icon-button label="Blue" /></dropdown-menu-item><dropdown-menu-item><icon-button label="Green" /></dropdown-menu-item></menu-button></div>'
});
