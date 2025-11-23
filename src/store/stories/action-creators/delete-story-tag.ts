import {Thunk} from 'react-hook-thunk-reducer';
import {StoriesState, StoriesAction, Story, Passage} from '../stories.types';

/**
 * Deletes a tag from a story and all its passages.
 */
export function deleteStoryTag(
  story: Story,
  tagName: string
): Thunk<StoriesState, StoriesAction> {
  return dispatch => {
    // Remove tag from story.tags
    if (story.tags.includes(tagName)) {
      dispatch({
        type: 'updateStory',
        storyId: story.id,
        props: {
          tags: story.tags.filter(tag => tag !== tagName)
        }
      });
    }
    // Remove tag from tagColors
    if (story.tagColors && story.tagColors[tagName]) {
      const tagColors = {...story.tagColors};
      delete tagColors[tagName];
      dispatch({
        type: 'updateStory',
        storyId: story.id,
        props: {tagColors}
      });
    }
    // Remove tag from all passages
    const passageUpdates: Record<string, Partial<Passage>> = {};
    story.passages.forEach(passage => {
      if (passage.tags.includes(tagName)) {
        passageUpdates[passage.id] = {
          tags: passage.tags.filter(tag => tag !== tagName)
        };
      }
    });
    if (Object.keys(passageUpdates).length > 0) {
      dispatch({
        type: 'updatePassages',
        storyId: story.id,
        passageUpdates
      });
    }
  };
}
