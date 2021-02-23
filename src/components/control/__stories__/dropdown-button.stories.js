import DropdownButton from '../dropdown-button';
import IconButton from '../dropdown-button';

export default {title: 'Control/<dropdown-button>'};

export const normal = () => ({
	components: {DropdownButton, IconButton},
	template: `<dropdown-button icon="threeDots" label="More">
		<icon-button icon="pencil" label="Edit" />
	</dropdown-button>`
});
