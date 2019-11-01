import LocalStorageQuota from '../index';
import notes from './local-storage-quota.notes.md';

export default {title: '<local-storage-quota>', parameters: {notes}};

export const normal = () => ({
	components: {LocalStorageQuota},
	template: '<local-storage-quota />'
});
