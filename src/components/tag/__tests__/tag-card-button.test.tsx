import {fireEvent, render, screen} from '@testing-library/react';
import * as React from 'react';
import {TagCardButton, TagCardButtonProps} from '../tag-card-button';
import {axe} from 'jest-axe';

jest.mock('../../../components/control/autocomplete-text-input');

describe('<TagCardButton>', () => {
	function renderComponent(props?: Partial<TagCardButtonProps>) {
		return render(
			<TagCardButton
				allTags={[]}
				onAdd={jest.fn()}
				onChangeColor={jest.fn()}
				onRemove={jest.fn()}
				tagColors={{}}
				tags={[]}
				{...props}
			/>
		);
	}

	it('has a Tags label if there are no tags', () => {
		renderComponent();
		expect(screen.getByRole('button', {name: 'common.tags'})).toBeVisible();
	});

	it('has the number of tags in its label if there are more than one', () => {
		renderComponent({tags: ['one', 'two']});
		expect(
			screen.getByRole('button', {
				name: 'components.tagCardButton.tagsWithCount_plural'
			})
		).toBeVisible();
	});

	describe('When the card is opened', () => {
		it('allows adding a new tag', () => {
			const onAdd = jest.fn();

			renderComponent({onAdd});
			fireEvent.click(screen.getByRole('button', {name: 'common.tags'}));
			fireEvent.change(
				screen.getByRole('textbox', {
					name: 'components.tagCardButton.tagNameLabel'
				}),
				{target: {value: 'new-tag'}}
			);
			expect(onAdd).not.toHaveBeenCalled();
			fireEvent.click(screen.getByRole('button', {name: 'common.add'}));
			expect(onAdd.mock.calls).toEqual([['new-tag']]);
		});

		it("sets autocompletions to all tags that haven't already been added", () => {
			renderComponent({
				allTags: ['one', 'two', 'three'],
				tags: ['one', 'three']
			});
			fireEvent.click(
				screen.getByRole('button', {
					name: 'components.tagCardButton.tagsWithCount_plural'
				})
			);
			expect(
				(
					screen
						.getByText('components.tagCardButton.tagNameLabel')
						.closest('[data-completions]') as HTMLElement
				).dataset.completions
			).toBe(JSON.stringify(['two']));
		});

		it('clears the text field after adding a tag', async () => {
			renderComponent();
			fireEvent.click(screen.getByRole('button', {name: 'common.tags'}));
			fireEvent.change(
				screen.getByRole('textbox', {
					name: 'components.tagCardButton.tagNameLabel'
				}),
				{target: {value: 'new-tag'}}
			);
			fireEvent.click(screen.getByRole('button', {name: 'common.add'}));
			expect(
				screen.getByRole('textbox', {
					name: 'components.tagCardButton.tagNameLabel'
				})
			).toHaveValue('');
		});

		it('clears the text field after closing the card', async () => {
			renderComponent();
			fireEvent.click(screen.getByRole('button', {name: 'common.tags'}));
			fireEvent.change(
				screen.getByRole('textbox', {
					name: 'components.tagCardButton.tagNameLabel'
				}),
				{target: {value: 'new-tag'}}
			);
			fireEvent.click(screen.getByRole('button', {name: 'common.tags'}));
			fireEvent.click(screen.getByRole('button', {name: 'common.tags'}));
			expect(
				screen.getByRole('textbox', {
					name: 'components.tagCardButton.tagNameLabel'
				})
			).toHaveValue('');
		});

		it('prevents adding a tag already present', () => {
			renderComponent({tags: ['test']});
			fireEvent.click(
				screen.getByRole('button', {
					name: 'components.tagCardButton.tagsWithCount_plural'
				})
			);
			fireEvent.change(
				screen.getByRole('textbox', {
					name: 'components.tagCardButton.tagNameLabel'
				}),
				{target: {value: 'test'}}
			);
			expect(screen.getByRole('button', {name: 'common.add'})).toBeDisabled();
		});

		it('prevents adding an invalid tag', () => {
			renderComponent();
			fireEvent.click(
				screen.getByRole('button', {
					name: 'common.tags'
				})
			);
			fireEvent.change(
				screen.getByRole('textbox', {
					name: 'components.tagCardButton.tagNameLabel'
				}),
				{target: {value: 'test'}}
			);
			expect(
				screen.getByRole('button', {name: 'common.add'})
			).not.toBeDisabled();
			fireEvent.change(
				screen.getByRole('textbox', {
					name: 'components.tagCardButton.tagNameLabel'
				}),
				{target: {value: ''}}
			);
			expect(screen.getByRole('button', {name: 'common.add'})).toBeDisabled();
		});

		describe('The tag list it shows', () => {
			it('has one tag per tag in props', () => {
				renderComponent({tags: ['test1', 'test2']});
				fireEvent.click(
					screen.getByRole('button', {
						name: 'components.tagCardButton.tagsWithCount_plural'
					})
				);
				expect(screen.getByRole('button', {name: 'test1'})).toBeVisible();
				expect(screen.getByRole('button', {name: 'test2'})).toBeVisible();
			});

			it('passes through color changes', () => {
				const onChangeColor = jest.fn();

				renderComponent({onChangeColor, tags: ['test']});
				fireEvent.click(
					screen.getByRole('button', {
						name: 'components.tagCardButton.tagsWithCount_plural'
					})
				);
				fireEvent.click(screen.getByRole('button', {name: 'test'}));
				expect(onChangeColor).not.toHaveBeenCalled();
				fireEvent.click(screen.getByRole('checkbox', {name: 'colors.red'}));
				expect(onChangeColor.mock.calls).toEqual([['test', 'red']]);
			});

			it('passes through removals', () => {
				const onRemove = jest.fn();

				renderComponent({onRemove, tags: ['test']});
				fireEvent.click(
					screen.getByRole('button', {
						name: 'components.tagCardButton.tagsWithCount_plural'
					})
				);
				fireEvent.click(screen.getByRole('button', {name: 'test'}));
				expect(onRemove).not.toHaveBeenCalled();
				fireEvent.click(screen.getByRole('button', {name: 'common.remove'}));
				expect(onRemove.mock.calls).toEqual([['test']]);
			});
		});
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
