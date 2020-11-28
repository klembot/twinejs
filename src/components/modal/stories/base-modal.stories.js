import BaseModal from '../base-modal';

export default {title: 'Modal/<base-modal>'};

export const basic = () => ({
	components: {BaseModal},
	template:
		'<base-modal><p style="color: white">This is a base modal.</p></base-modal>'
});
