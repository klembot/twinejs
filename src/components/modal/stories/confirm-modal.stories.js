import ConfirmModal from '../confirm-modal';

export default {title: 'Modal/<confirm-modal>'};

export const basic = () => ({
	components: {ConfirmModal},
	template:
		'<confirm-modal message="Are you sure you want to do this?" visible />'
});

export const withDetail = () => ({
	components: {ConfirmModal},
	template:
		'<confirm-modal message="Are you sure you want to do this?" detail="This cannot be undone." visible />'
});
