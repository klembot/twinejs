import FileUpload from '../file-upload.vue';

export default {title: 'Control/<file-upload>'};

export const normal = () => ({
	components: {FileUpload},
	template: '<file-upload>Label</file-upload>'
});
