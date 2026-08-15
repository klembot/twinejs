import {fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {FakeStateProvider, PrefInspector} from '../../../test-util';
import {KeyboardShortcutsDialog} from '../keyboard-shortcuts-dialog';

describe('<KeyboardShortcutsDialog>', () => {
	function renderComponent(prefs = {}) {
		return render(
			<FakeStateProvider prefs={prefs}>
				<KeyboardShortcutsDialog
					collapsed={false}
					onChangeCollapsed={jest.fn()}
					onChangeHighlighted={jest.fn()}
					onChangeMaximized={jest.fn()}
					onClose={jest.fn()}
				/>
				<PrefInspector name="hotkeyOverrides" />
			</FakeStateProvider>
		);
	}

	function rowFor(commandId: string) {
		return screen.getByText(commandId).closest('tr') as HTMLElement;
	}

	it('lists commands with their IDs and bindings', () => {
		renderComponent();
		expect(screen.getByText('passage.create')).toBeInTheDocument();
		expect(within(rowFor('passage.create')).getByText('N')).toBeInTheDocument();
	});

	it('shows commands that have no binding', () => {
		renderComponent();
		expect(
			within(rowFor('story.details')).getByText(
				'dialogs.keyboardShortcuts.unbound'
			)
		).toBeInTheDocument();
	});

	it('filters as the user types', () => {
		renderComponent();
		fireEvent.change(
			screen.getByLabelText('dialogs.keyboardShortcuts.search'),
			{target: {value: 'passage.create'}}
		);
		expect(screen.getByText('passage.create')).toBeInTheDocument();
		expect(screen.queryByText('story.details')).not.toBeInTheDocument();
	});

	it('filters by scope token', () => {
		renderComponent();
		fireEvent.change(
			screen.getByLabelText('dialogs.keyboardShortcuts.search'),
			{target: {value: '@scope:fuzzy-finder'}}
		);
		expect(screen.getByText('finder.close')).toBeInTheDocument();
		expect(screen.queryByText('passage.create')).not.toBeInTheDocument();
	});

	it('says so when nothing matches', () => {
		renderComponent();
		fireEvent.change(
			screen.getByLabelText('dialogs.keyboardShortcuts.search'),
			{target: {value: 'nothing matches this'}}
		);
		expect(
			screen.getByText('dialogs.keyboardShortcuts.noMatchingCommands')
		).toBeInTheDocument();
	});

	it('shows a user override and lets it be reset', () => {
		renderComponent({hotkeyOverrides: {'passage.create': ['j']}});
		expect(within(rowFor('passage.create')).getByText('J')).toBeInTheDocument();
		fireEvent.click(
			within(rowFor('passage.create')).getByLabelText(
				'dialogs.keyboardShortcuts.resetBinding'
			)
		);
		expect(
			screen.getByTestId('pref-inspector-hotkeyOverrides')
		).toHaveTextContent('{}');
	});

	it('unbinds a command', () => {
		renderComponent();
		fireEvent.click(
			within(rowFor('passage.create')).getByLabelText(
				'dialogs.keyboardShortcuts.removeBinding'
			)
		);
		expect(
			screen.getByTestId('pref-inspector-hotkeyOverrides')
		).toHaveTextContent('{"passage.create":[]}');
	});

	it('records a new binding, warning about a key already in use', () => {
		renderComponent();
		fireEvent.click(
			within(rowFor('passage.create')).getByLabelText(
				'dialogs.keyboardShortcuts.changeBinding'
			)
		);
		expect(
			screen.getByText('dialogs.keyboardShortcuts.capture.waiting')
		).toBeInTheDocument();

		// Enter is already used by passage.edit in the story map.

		fireEvent.keyDown(document.activeElement!, {code: 'Enter', key: 'Enter'});
		expect(
			screen.getByText('dialogs.keyboardShortcuts.capture.conflict')
		).toBeInTheDocument();
		fireEvent.click(screen.getByText('dialogs.keyboardShortcuts.capture.save'));
		expect(
			screen.getByTestId('pref-inspector-hotkeyOverrides')
		).toHaveTextContent('{"passage.create":["enter"]}');
	});

	it('cancels capture on Escape without changing anything', () => {
		renderComponent();
		fireEvent.click(
			within(rowFor('passage.create')).getByLabelText(
				'dialogs.keyboardShortcuts.changeBinding'
			)
		);
		fireEvent.keyDown(document.activeElement!, {code: 'Escape', key: 'Escape'});
		expect(
			screen.queryByText('dialogs.keyboardShortcuts.capture.waiting')
		).not.toBeInTheDocument();
		expect(
			screen.getByTestId('pref-inspector-hotkeyOverrides')
		).toHaveTextContent('{}');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		// Narrowed to a single row: axe over the whole catalog is slow enough to
		// time the test out, and every row has the same markup.

		fireEvent.change(
			screen.getByLabelText('dialogs.keyboardShortcuts.search'),
			{target: {value: 'passage.create'}}
		);
		expect(await axe(container)).toHaveNoViolations();
	});
});
