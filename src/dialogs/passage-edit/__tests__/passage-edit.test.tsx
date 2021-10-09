import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {MockStateContextProvider} from '../../../test-util';
import {UndoableStoriesContext} from '../../../store/undoable-stories';
import {PassageEditDialog, PassageEditDialogProps} from '../passage-edit';

jest.mock('../../../components/control/code-area/code-area');

describe('<PassageEditDialog>', () => {
	function renderComponent(props?: Partial<PassageEditDialogProps>) {
		return render(
			<MockStateContextProvider>
				<UndoableStoriesContext.Consumer>
					{({stories}) => (
						<PassageEditDialog
							collapsed={false}
							onChangeCollapsed={jest.fn()}
							onClose={jest.fn()}
							passageId={stories[0].passages[0].id}
							storyId={stories[0].id}
							{...props}
						/>
					)}
				</UndoableStoriesContext.Consumer>
			</MockStateContextProvider>
		);
	}

	describe('when the passage does not exist in state', () => {
		it('renders nothing', () => {
			renderComponent({passageId: 'nonexistent'});
			expect(document.body.textContent).toBe('');
		});

		it('calls the onClose prop', () => {
			const onClose = jest.fn();

			renderComponent({onClose, passageId: 'nonexistent'});
			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
