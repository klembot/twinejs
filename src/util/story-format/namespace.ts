import {StoryFormat} from '../../store/story-formats';

/**
 * Returns a namespace prefix for a story format that is compatible with
 * CodeMirror names (modes and commands).
 */
export function namespaceForFormat(format: StoryFormat) {
	return format.name.toLowerCase().replace(/\s/g, '-') + '-' + format.version;
}
