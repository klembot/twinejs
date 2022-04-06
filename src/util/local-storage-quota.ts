/**
 * Returns how much local storage space is being used in characters.
 */
export function localStorageUsedSpace() {
	return JSON.stringify(window.localStorage).length;
}

/**
 * Resolves to how much local storage space is available in characters.
 * @param chunkSize granularity of the check
 * @param intervalDelay how much time to allow between checks
 */
export function localStorageFreeSpace(chunkSize = 100000, intervalDelay = 20) {
	return new Promise<number>(resolve => {
		const testString = 'x'.repeat(chunkSize);
		let usedChunks = 0;
		const interval = window.setInterval(() => {
			try {
				window.localStorage.setItem(`__freeSpaceTest${usedChunks}`, testString);
				usedChunks++;
			} catch (error) {
				// We've run out of space. Clean up our test items and resolve.

				for (let i = 0; i <= usedChunks; i++) {
					try {
						window.localStorage.removeItem(`__freeSpaceTest${i}`);
					} catch (e) {
						// Keep going--hopefully it was a temporary error. We still need to
						// clean up the rest of our work.
					}
				}

				window.clearInterval(interval);
				resolve(usedChunks * chunkSize);
			}
		}, intervalDelay);
	});
}
