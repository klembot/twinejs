import BaseModal from '../base-modal';
import notes from './base-modal.notes.md';

export default {title: 'Modal/<base-modal>', parameters: {notes}};

export const normal = () => ({
	components: {BaseModal},
	template:
		'<base-modal id="normal-base-modal" :open="true"><template v-slot:title>Title</template><template v-slot:content>Content</template></base-modal>'
});
