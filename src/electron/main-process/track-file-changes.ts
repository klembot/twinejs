import {stat} from 'fs-extra';

// Tracks the most recently-seen mtime for a story file, so that if it has
// changed when we're asked to save, we prompt the user as to what to do.

const fileMtimes: Record<string, number> = {};

/**
 * Record the current modification time of a file so that
 * wasFileChangedExternally() can track it.
 */
export async function fileWasTouched(path: string) {
	fileMtimes[path] = (await stat(path)).mtimeMs;
}

/**
 * Stop tracking a file's modification time.
 */
export function stopTrackingFile(path: string) {
	delete fileMtimes[path];
}

/**
 * Has a file been changed since recordFileChange was last called on it?
 */
export async function wasFileChangedExternally(path: string): Promise<boolean> {
	if (!fileMtimes[path]) {
		return false;
	}

	return (await stat(path)).mtimeMs !== fileMtimes[path];
}
