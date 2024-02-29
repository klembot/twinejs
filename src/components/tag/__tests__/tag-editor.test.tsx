import {act, fireEvent, render, screen} from '@testing-library/react';
import {lorem} from 'faker';
import {axe} from 'jest-axe';
import * as React from 'react';
import {TagEditor, TagEditorProps} from '../tag-editor';

describe('<TagEditor>', () => {
	async function renderComponent(props?: Partial<TagEditorProps>) {
		const tagName = lorem.word();
		const mockCount = 1;
		const result = render(
			<TagEditor
				allTags={[tagName]}
				name={tagName}
				count={mockCount}
				onChangeColor={jest.fn()}
				onChangeName={jest.fn()}
				{...props}
			/>
		);

		await act(async () => Promise.resolve());
		return result;
	}

	it('displays the name of the tag', async () => {
		await renderComponent({name: 'test name'});
		expect(screen.getByText('test name')).toBeInTheDocument();
	});
	it('displays the frequency of the tag', async() => {
		await renderComponent({ count: 1});
		expect(screen.getByText('1 passage')).toBeInTheDocument();

		await renderComponent({ count: 2});
		expect(screen.getByText('2 passages')).toBeInTheDocument();
	})

	it('calls the onChangeColor prop when the color is changed', async () => {
		const onChangeColor = jest.fn();

		await renderComponent({onChangeColor});
		expect(onChangeColor).not.toHaveBeenCalled();
		fireEvent.change(screen.getByRole('combobox'), {
			target: {value: 'red'}
		});
		expect(onChangeColor.mock.calls).toEqual([['red']]);
	});

	it('calls the onChangeName prop when the name is changed', async () => {
		const onChangeName = jest.fn();

		await renderComponent({onChangeName});
		expect(onChangeName).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.rename'));
		fireEvent.change(
			screen.getByRole('textbox', {name: 'common.renamePrompt'}),
			{
				target: {value: 'new-name'}
			}
		);
		await act(async () => Promise.resolve()); // Wait for <PromptButton> to update
		fireEvent.click(screen.getByText('common.ok'));
		expect(onChangeName.mock.calls).toEqual([['new-name']]);
	});

	it('does not allow renaming the tag to a pre-existing name', async () => {
		await renderComponent({allTags: ['already-exists']});
		fireEvent.click(screen.getByText('common.rename'));
		fireEvent.change(
			screen.getByRole('textbox', {name: 'common.renamePrompt'}),
			{
				target: {value: 'already-exists'}
			}
		);
		await act(async () => Promise.resolve()); // Wait for <PromptButton> to update
		expect(screen.getByText('common.ok')).toBeDisabled();
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
