import {faker} from '@faker-js/faker';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import * as detectIt from 'detect-it';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakePassage} from '../../../test-util';
import {passageIsEmpty} from '../../../util/passage-is-empty';
import {PassageCard, PassageCardProps} from '../passage-card';

jest.mock('../../tag/tag-stripe');
jest.mock('../../../util/passage-is-empty');

describe('<PassageCard>', () => {
	const passageIsEmptyMock = passageIsEmpty as jest.Mock;
	const oldDeviceType = detectIt.deviceType;

	beforeEach(() => passageIsEmptyMock.mockReturnValue(false));

	afterAll(() => {
		(detectIt as any).deviceType = oldDeviceType;
	});

	function renderComponent(props?: Partial<PassageCardProps>) {
		return render(
			<PassageCard
				onDeselect={jest.fn()}
				onEdit={jest.fn()}
				onSelect={jest.fn()}
				passage={fakePassage()}
				tagColors={{}}
				{...props}
			/>
		);
	}

	it('should include data-passage-tag attribute with space-separated tags', () => {
		const tags = [faker.lorem.slug(), faker.lorem.slug()];
		const passage = fakePassage({tags});
		renderComponent({passage});

		const passageElement = document.querySelector('.passage-card');
		expect(passageElement).toHaveAttribute('data-passage-tags', tags.join(' '));
	});

	it('should include data-passage-tag with an empty string when passage has no tags', () => {
		const passage = fakePassage({tags: []});
		renderComponent({passage});

		const passageElement = document.querySelector('.passage-card');
		expect(passageElement).toHaveAttribute('data-passage-tags', '');
	});

	it('displays the passage name', () => {
		const passage = fakePassage();

		renderComponent({passage});
		expect(screen.getByText(passage.name)).toBeInTheDocument();
	});

	it('displays an excerpt of the passage text', () => {
		const passage = fakePassage({text: "short text that won't be truncated"});

		renderComponent({passage});
		expect(screen.getByText(passage.text)).toBeInTheDocument();
	});

	it("gives it an 'empty' CSS class if the passage is empty", () => {
		passageIsEmptyMock.mockReturnValue(true);
		renderComponent({passage: fakePassage()});
		expect(document.querySelector('.passage-card.empty')).toBeInTheDocument();
	});

	it("doesn't give it an 'empty' CSS class if the passage is empty", () => {
		passageIsEmptyMock.mockReturnValue(false);
		renderComponent({passage: fakePassage()});
		expect(
			document.querySelector('.passage-card.empty')
		).not.toBeInTheDocument();
	});

	describe('when passage text is empty', () => {
		const passage = fakePassage({text: ''});

		it('displays a touch-oriented placeholder message on a touch device', () => {
			(detectIt as any).deviceType = 'touchOnly';
			renderComponent({passage});
			expect(
				screen.getByText('components.passageCard.placeholderTouch')
			).toBeInTheDocument();
		});

		it('displays mouse-oriented text on any other type of device', () => {
			(detectIt as any).deviceType = 'mouseOnly';
			renderComponent({passage});
			expect(
				screen.getByText('components.passageCard.placeholderClick')
			).toBeInTheDocument();
			(detectIt as any).deviceType = 'hybrid';
			cleanup();
			renderComponent({passage});
			expect(
				screen.getByText('components.passageCard.placeholderClick')
			).toBeInTheDocument();
		});
	});

	it('displays a <TagStripe> of passage tags', () => {
		const passage = fakePassage({tags: ['mock-tag-1', 'mock-tag-2']});

		renderComponent({passage});
		expect(screen.getByTestId('mock-tag-stripe')).toHaveTextContent(
			'mock-tag-1 mock-tag-2'
		);
	});

	it('positions the card based on the passage props', () => {
		const passage = fakePassage({left: 200, top: 400});

		renderComponent({passage});

		const style = window.getComputedStyle(
			document.querySelector('.passage-card')!
		);

		// Zoom does not change positioning. This is handled by <PassageMap>
		// instead.
		expect(style.getPropertyValue('left')).toBe('200px');
		expect(style.getPropertyValue('top')).toBe('400px');
	});

	it('calls the onEdit prop when the card is double-clicked', () => {
		const onEdit = jest.fn();
		const passage = fakePassage();

		renderComponent({onEdit, passage});
		expect(onEdit).not.toHaveBeenCalled();
		fireEvent.dblClick(screen.getByText(passage.name));
		expect(onEdit.mock.calls).toEqual([[passage]]);
	});

	it('calls the onSelect prop when the card is clicked when unselected', () => {
		const onDeselect = jest.fn();
		const onSelect = jest.fn();
		const passage = fakePassage({selected: false});

		renderComponent({onDeselect, onSelect, passage});
		expect(onDeselect).not.toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
		fireEvent.mouseDown(screen.getByText(passage.name));
		expect(onDeselect).not.toHaveBeenCalled();
		expect(onSelect).toHaveBeenCalledTimes(1);
	});

	it('calls neither onDeselect or onSelect props when the card is clicked when selected', () => {
		const onDeselect = jest.fn();
		const onSelect = jest.fn();
		const passage = fakePassage({selected: true});

		renderComponent({onDeselect, onSelect, passage});
		expect(onDeselect).not.toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
		fireEvent.mouseDown(screen.getByText(passage.name));
		expect(onDeselect).not.toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
	});

	it('calls the onDeselect prop when the card is clicked with the shift or control key held and the passage is selected', () => {
		['ctrlKey', 'shiftKey'].forEach(key => {
			const onDeselect = jest.fn();
			const onSelect = jest.fn();
			const passage = fakePassage({selected: true});

			renderComponent({onDeselect, onSelect, passage});
			expect(onDeselect).not.toHaveBeenCalled();
			expect(onSelect).not.toHaveBeenCalled();
			fireEvent.mouseDown(screen.getByText(passage.name), {[key]: true});
			expect(onDeselect).toHaveBeenCalledTimes(1);
			expect(onSelect).not.toHaveBeenCalled();
		});
	});

	it('calls the onSelect prop with a nonexclusive argument when the card is clicked with the control key held and the passage is unselected', () => {
		const onDeselect = jest.fn();
		const onSelect = jest.fn();
		const passage = fakePassage({selected: false});

		renderComponent({onDeselect, onSelect, passage});
		expect(onDeselect).not.toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
		fireEvent.mouseDown(screen.getByText(passage.name), {ctrlKey: true});
		expect(onDeselect).not.toHaveBeenCalled();
		expect(onSelect.mock.calls).toEqual([[passage, false]]);
	});

	it.todo('passes through drag events');

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
