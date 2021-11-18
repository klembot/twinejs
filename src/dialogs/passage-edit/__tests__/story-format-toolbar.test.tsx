import {fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakeLoadedStoryFormat} from '../../../test-util';
import {
	StoryFormatToolbar,
	StoryFormatToolbarProps
} from '../story-format-toolbar';
import {useFormatCodeMirrorToolbar} from '../../../store/use-format-codemirror-toolbar';

jest.mock('../../../components/control/menu-button');
jest.mock('../../../store/use-format-codemirror-toolbar');

describe('<StoryFormatToolbar>', () => {
	const useFormatToolbarMock = useFormatCodeMirrorToolbar as jest.Mock;

	beforeEach(() => {
		useFormatToolbarMock.mockReturnValue(() => [
			{
				command: 'mock-command',
				icon: 'mock-icon-src',
				label: 'mock-label',
				type: 'button'
			}
		]);
	});

	function renderComponent(props?: Partial<StoryFormatToolbarProps>) {
		return render(
			<StoryFormatToolbar
				editor={{execCommand: jest.fn()} as any}
				storyFormat={fakeLoadedStoryFormat()}
				{...props}
			/>
		);
	}

	it('displays a button that runs a CodeMirror command for format toolbar buttons', () => {
		const execCommand = jest.fn();

		useFormatToolbarMock.mockReturnValue(() => [
			{
				command: 'mock-command',
				icon: 'mock-icon-src',
				label: 'mock-label',
				type: 'button'
			}
		]);

		renderComponent({editor: {execCommand} as any});

		const button = screen.getByRole('button', {name: 'mock-label'});

		expect(button).toBeInTheDocument();
		expect(within(button).getByRole('img').getAttribute('src')).toBe(
			'mock-icon-src'
		);
		expect(execCommand).not.toHaveBeenCalled();
		fireEvent.click(button);
		expect(execCommand.mock.calls).toEqual([['mock-command']]);
	});

	it('displays a menu button for format toolbar menus', () => {
		const execCommand = jest.fn();

		useFormatToolbarMock.mockReturnValue(() => [
			{
				type: 'menu',
				icon: 'mock-menu-icon-src',
				label: 'mock-menu-label',
				items: [
					{
						command: 'mock-command',
						label: 'mock-button-label',
						type: 'button'
					},
					{type: 'separator'}
				]
			}
		]);

		renderComponent({editor: {execCommand} as any});

		const button = screen.getByRole('button', {name: 'mock-button-label'});

		expect(button).toBeInTheDocument();
		expect(execCommand).not.toHaveBeenCalled();
		fireEvent.click(button);
		expect(execCommand.mock.calls).toEqual([['mock-command']]);
	});

	it('renders nothing if the editor prop is undefined', () => {
		renderComponent({editor: undefined});
		expect(document.body.textContent).toBe('');
	});

	it('renders nothing if the toolbar factory function is not actually a function', () => {
		jest.spyOn(console, 'error').mockReturnValue();
		useFormatToolbarMock.mockReturnValue({notAFunction: true});
		renderComponent();
		expect(document.body.textContent).toBe('');
	});

	it('renders nothing if the toolbar factory function throws an error', () => {
		jest.spyOn(console, 'error').mockReturnValue();
		useFormatToolbarMock.mockReturnValue(() => {
			throw new Error();
		});
		renderComponent();
		expect(document.body.textContent).toBe('');
	});

	it('skips toolbar items with unknown types', () => {
		useFormatToolbarMock.mockReturnValue(() => [
			{
				type: 'incorrect'
			},
			{
				command: 'mock-command',
				icon: 'mock-icon-src',
				label: 'mock-label',
				type: 'button'
			}
		]);

		renderComponent();
		expect(
			screen.getByRole('button', {name: 'mock-label'})
		).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
