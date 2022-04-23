import {
	fireEvent,
	render,
	screen,
	waitFor,
	within
} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	fakeLoadedStoryFormat,
	FakeStateProvider,
	FakeStateProviderProps
} from '../../../test-util';
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

	function renderComponent(
		props?: Partial<StoryFormatToolbarProps>,
		context?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...context}>
				<StoryFormatToolbar
					editor={{off: jest.fn(), on: jest.fn()} as any}
					onExecCommand={jest.fn()}
					storyFormat={fakeLoadedStoryFormat()}
					{...props}
				/>
			</FakeStateProvider>
		);
	}

	it('passes the editor instance and environment to the format toolbar factory function', () => {
		const factory = jest.fn(() => []);

		useFormatToolbarMock.mockReturnValue(factory);
		renderComponent({}, {prefs: {appTheme: 'dark', locale: 'mock-locale'}});
		expect(factory.mock.calls).toEqual([
			[
				{on: expect.any(Function), off: expect.any(Function)},
				// jsdom limitations on foregroundColor
				{appTheme: 'dark', foregroundColor: '', locale: 'mock-locale'}
			]
		]);
	});

	it('displays a button that runs a CodeMirror command for format toolbar buttons', () => {
		const onExecCommand = jest.fn();

		useFormatToolbarMock.mockReturnValue(() => [
			{
				command: 'mock-command',
				icon: 'mock-icon-src',
				label: 'mock-label',
				type: 'button'
			}
		]);

		renderComponent({onExecCommand});

		const button = screen.getByRole('button', {name: 'mock-label'});

		expect(button).toBeInTheDocument();
		expect(within(button).getByRole('img').getAttribute('src')).toBe(
			'mock-icon-src'
		);
		expect(onExecCommand).not.toHaveBeenCalled();
		fireEvent.click(button);
		expect(onExecCommand.mock.calls).toEqual([['mock-command']]);
	});

	it('displays icon-only buttons properly', () => {
		useFormatToolbarMock.mockReturnValue(() => [
			{
				command: 'mock-command',
				icon: 'mock-icon-src',
				iconOnly: true,
				label: 'mock-label',
				type: 'button'
			}
		]);

		renderComponent();
		expect(screen.queryByText('mock-label')).not.toBeInTheDocument();
		expect(screen.getByLabelText('mock-label')).toBeInTheDocument();
	});

	it('displays a menu button for format toolbar menus', () => {
		const onExecCommand = jest.fn();

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

		renderComponent({onExecCommand});

		const button = screen.getByRole('button', {name: 'mock-button-label'});

		expect(button).toBeInTheDocument();
		expect(onExecCommand).not.toHaveBeenCalled();
		fireEvent.click(button);
		expect(onExecCommand.mock.calls).toEqual([['mock-command']]);
	});

	// Needs a more accurate mock of <MenuButton>.
	it.todo('displays icon-only menu buttons properly');

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

	it('updates after running a command', async () => {
		renderComponent();
		useFormatToolbarMock.mockClear();
		fireEvent.click(screen.getByRole('button'));
		await waitFor(() => expect(useFormatToolbarMock).toBeCalledTimes(1));
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
