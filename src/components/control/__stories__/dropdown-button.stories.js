import DropdownButton from '../dropdown-button';
import IconButton from '../dropdown-button';

export default {title: 'Control/<dropdown-button>'};

export const normal = () => ({
	components: {DropdownButton, IconButton},
	template: `<dropdown-button icon="more-horizontal" label="More">
		<icon-button icon="edit" label="Edit" />
	</dropdown-button>`
});
