import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Story} from '../../store/stories';
import {fakeStory} from '../../test-util';
import {BuildActions, BuildActionsProps} from '../build-actions';

describe('<BuildActions>', () => {
	function renderComponent(props?: Partial<BuildActionsProps>) {
		return render(<BuildActions story={fakeStory()} {...props} />);
	}

	describe('when not given a story prop', () => {
		beforeEach(() => renderComponent({story: undefined}));

		it('disables the test button', () =>
			expect(screen.getByText('routeActions.build.test')).toBeDisabled());
	});

	describe('when given a story prop', () => {
		let openSpy: jest.SpyInstance;
		let story: Story;

		beforeEach(() => {
			openSpy = jest.spyOn(window, 'open').mockReturnValue();
			story = fakeStory();
			renderComponent({story});
		});

		it('displays a button to test the story', () => {
			expect(openSpy).not.toHaveBeenCalled();
			fireEvent.click(screen.getByText('routeActions.build.test'));
			expect(openSpy.mock.calls).toEqual([
				[`#/stories/${story.id}/test`, '_blank']
			]);
		});

		it('displays a button to play the story', () => {
			expect(openSpy).not.toHaveBeenCalled();
			fireEvent.click(screen.getByText('routeActions.build.play'));
			expect(openSpy.mock.calls).toEqual([
				[`#/stories/${story.id}/play`, '_blank']
			]);
		});

		it('displays a button to proof the story', () => {
			expect(openSpy).not.toHaveBeenCalled();
			fireEvent.click(screen.getByText('routeActions.build.proof'));
			expect(openSpy.mock.calls).toEqual([
				[`#/stories/${story.id}/proof`, '_blank']
			]);
		});

		it.todo('displays a button to publish the story to a file');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
