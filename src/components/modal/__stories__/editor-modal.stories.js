import EditorModal from '../editor-modal';

export default {title: 'Modal/<editor-modal>'};

export const normal = () => ({
	components: {EditorModal},
	template:
		'<editor-modal id="normal-editor-modal" :open="true"><template v-slot:title>Title</template><template v-slot:content>Content</template></editor-modal>'
});
