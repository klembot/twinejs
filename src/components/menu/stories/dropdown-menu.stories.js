import DropdownMenu from '../dropdown-menu';
import DropdownMenuDivider from '../dropdown-menu-divider';
import DropdownMenuItem from '../dropdown-menu-item';
import IconButton from '../../input/icon-button';

export default {title: 'Menu/<dropdown-menu>'};

export const simple = () => ({
	components: {DropdownMenu, DropdownMenuItem, IconButton},
	template: `<dropdown-menu>
			<dropdown-menu-item><icon-button label="Red" /></dropdown-menu-item>
			<dropdown-menu-item><icon-button label="Green" /></dropdown-menu-item>
			<dropdown-menu-item><icon-button label="Blue" /></dropdown-menu-item>
		</dropdown-menu>`
});

export const withDivider = () => ({
	components: {DropdownMenu, DropdownMenuDivider, DropdownMenuItem, IconButton},
	template: `<dropdown-menu>
			<dropdown-menu-item><icon-button label="Red" /></dropdown-menu-item>
			<dropdown-menu-divider />
			<dropdown-menu-item><icon-button label="Green" /></dropdown-menu-item>
			<dropdown-menu-divider />
			<dropdown-menu-item><icon-button label="Blue" /></dropdown-menu-item>
		</dropdown-menu>`
});

export const withChecks = () => ({
	components: {DropdownMenu, DropdownMenuItem, IconButton},
	template: `<dropdown-menu>
			<dropdown-menu-item :checked="true"><icon-button label="Red" /></dropdown-menu-item>
			<dropdown-menu-item><icon-button label="Green" /></dropdown-menu-item>
			<dropdown-menu-item :checked="true"><icon-button label="Blue" /></dropdown-menu-item>
		</dropdown-menu>`
});
