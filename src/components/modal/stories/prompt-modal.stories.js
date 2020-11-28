import PromptModal from '../prompt-modal';

export default {title: 'Modal/<prompt-modal>'};

export const basic = () => ({
	components: {PromptModal},
	template:
		'<prompt-modal default-value="Untitled Story 1" message="Rename This Story" detail="What should this story be named?" visible />'
});
