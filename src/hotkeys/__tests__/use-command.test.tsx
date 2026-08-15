import {fireEvent, render, screen} from '@testing-library/react';
import * as React from 'react';
import {FakeStateProvider} from '../../test-util';
import {Command} from '../commands.types';
import {useCommand} from '../use-command';

const TestCommand: React.FC<Partial<Command> & {run: () => void}> = props => {
	useCommand({
		id: 'passage.create',
		label: 'test',
		scope: 'story-map',
		...props
	});

	return null;
};

function press(key: string, target: Element = document.activeElement!) {
	fireEvent.keyDown(target, {code: key, key});
}

describe('useCommand()', () => {
	it('runs the command when its default key is pressed in scope', () => {
		const run = jest.fn();

		render(
			<FakeStateProvider hotkeyScope="story-map">
				<TestCommand run={run} />
			</FakeStateProvider>
		);
		press('n');
		expect(run).toHaveBeenCalledTimes(1);
	});

	it('does not run outside its scope', () => {
		const run = jest.fn();

		render(
			<FakeStateProvider hotkeyScope="story-list">
				<TestCommand run={run} />
			</FakeStateProvider>
		);
		press('n');
		expect(run).not.toHaveBeenCalled();
	});

	it('does not run when disabled', () => {
		const run = jest.fn();

		render(
			<FakeStateProvider hotkeyScope="story-map">
				<TestCommand enabled={false} run={run} />
			</FakeStateProvider>
		);
		press('n');
		expect(run).not.toHaveBeenCalled();
	});

	it('does not run while a text field has focus', () => {
		const run = jest.fn();

		render(
			<FakeStateProvider hotkeyScope="story-map">
				<TestCommand run={run} />
				<input type="text" />
			</FakeStateProvider>
		);

		const input = screen.getByRole('textbox');

		input.focus();
		press('n', input);
		expect(run).not.toHaveBeenCalled();
	});

	it('runs in a text field if it opted in', () => {
		const run = jest.fn();

		render(
			<FakeStateProvider hotkeyScope="story-map">
				<TestCommand allowInInput run={run} />
				<input type="text" />
			</FakeStateProvider>
		);

		const input = screen.getByRole('textbox');

		input.focus();
		press('n', input);
		expect(run).toHaveBeenCalledTimes(1);
	});

	it('respects a user override of the key', () => {
		const run = jest.fn();

		render(
			<FakeStateProvider
				hotkeyScope="story-map"
				prefs={{hotkeyOverrides: {'passage.create': ['j']}}}
			>
				<TestCommand run={run} />
			</FakeStateProvider>
		);
		press('n');
		expect(run).not.toHaveBeenCalled();
		press('j');
		expect(run).toHaveBeenCalledTimes(1);
	});

	it('does not run when the user has unbound it', () => {
		const run = jest.fn();

		render(
			<FakeStateProvider
				hotkeyScope="story-map"
				prefs={{hotkeyOverrides: {'passage.create': []}}}
			>
				<TestCommand run={run} />
			</FakeStateProvider>
		);
		press('n');
		expect(run).not.toHaveBeenCalled();
	});

	it('stops after the first matching command, innermost scope first', () => {
		const inner = jest.fn();
		const outer = jest.fn();

		render(
			<FakeStateProvider hotkeyScope="story-map">
				<TestCommand run={outer} />
				<div data-hotkey-scope="dialog">
					<TestCommand run={inner} scope="dialog" />
				</div>
			</FakeStateProvider>
		);

		// Focus is on the story map scope, so only the outer command matches.

		press('n');
		expect(outer).toHaveBeenCalledTimes(1);
		expect(inner).not.toHaveBeenCalled();
	});

	it('only runs an element-scoped command when focus is inside that element', () => {
		const run = jest.fn();

		const Test: React.FC = () => {
			const ref = React.useRef<HTMLDivElement>(null);

			useCommand({
				element: ref,
				id: 'passage.create',
				label: 'test',
				run,
				scope: 'story-map'
			});

			return (
				<div ref={ref}>
					<button type="button">inside</button>
				</div>
			);
		};

		render(
			<FakeStateProvider hotkeyScope="story-map">
				<Test />
				<button type="button">outside</button>
			</FakeStateProvider>
		);

		const outside = screen.getByText('outside');

		outside.focus();
		press('n', outside);
		expect(run).not.toHaveBeenCalled();

		const inside = screen.getByText('inside');

		inside.focus();
		press('n', inside);
		expect(run).toHaveBeenCalledTimes(1);
	});

	it('stops registering when the component unmounts', () => {
		const run = jest.fn();
		const {rerender} = render(
			<FakeStateProvider hotkeyScope="story-map">
				<TestCommand run={run} />
			</FakeStateProvider>
		);

		press('n');
		expect(run).toHaveBeenCalledTimes(1);
		rerender(<FakeStateProvider hotkeyScope="story-map" />);
		press('n');
		expect(run).toHaveBeenCalledTimes(1);
	});
});
