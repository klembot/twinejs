import jsonp from 'jsonp';
import {StoryFormatProperties} from '../../store/story-formats';

let requestQueue = Promise.resolve();

/**
 * Fetches a story format's properties via JSONP. If multiple requests are made
 * at once, they will be queued by this function.
 */
export async function fetchStoryFormatProperties(
	url: string,
	timeout = 2000
): Promise<StoryFormatProperties> {
	return new Promise(
		(resolve, reject) =>
			(requestQueue = requestQueue.then(
				() =>
					new Promise(resolveQueue => {
						jsonp(url, {timeout, name: 'storyFormat'}, (err, data) => {
							if (err) {
								reject(err);
							} else {
								resolve(data);
							}

							resolveQueue();
						});
					})
			))
	);
}
