import ButtonBar from '../button-bar';
import IconButton from '../../control/icon-button';

export default {title: 'Container/<button-bar>'};

export const horizontal = () => ({
	components: {ButtonBar, IconButton},
	template: `
		<button-bar>
			<icon-button icon="x">Cancel</icon-button>
			<icon-button icon="check" type="primary">Save</icon-button>
		</button-bar>`
});

export const vertical = () => ({
	components: {ButtonBar, IconButton},
	template: `
		<button-bar orientation="vertical">
			<icon-button icon="edit">Edit</icon-button>
			<icon-button icon="copy">Duplicate</icon-button>
			<icon-button icon="trash-2" type="danger">Delete</icon-button>
		</button-bar>`
});
