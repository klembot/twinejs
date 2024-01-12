import { Story } from '../../store/stories/stories.types';

/**
 * Returns a filename for a story object that's guaranteed to be safe across all
 * platforms. For this, we use POSIX's definition
 * (http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_276)
 * with the addition of spaces, for legibility.
 */
export function storyFileName(story: Story, extension = '.html') {
	return encodeURIComponent(story.name).replace(/[^\w. -\u4e00-\u9fff\uac00-\ud7af\u3040-\u30ff\u3131-\u3163\u3190-\u319f\u31f0-\u31ff\u1100-\u11ff\uac00-\ud7af\u30a0-\u30ff\u3005-\u3007\u3041-\u3096\u3099-\u309e\u30a1-\u30fa\u30fc-\u30fe\u3131-\u318e\uff65-\uff9f\u31f0-\u31ff\u3190-\u319f\u2e80-\u2fd5\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g, '_') + extension;
}