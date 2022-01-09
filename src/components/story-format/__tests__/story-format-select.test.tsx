import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	fakeFailedStoryFormat,
	fakeLoadedStoryFormat,
	fakePendingStoryFormat
} from '../../../test-util';
import {
	StoryFormatSelect,
	StoryFormatSelectProps
} from '../story-format-select';

describe('<StoryFormatSelect>', () => {
	function renderComponent(props?: Partial<StoryFormatSelectProps>) {
		const format = fakeLoadedStoryFormat();

		return render(
			<StoryFormatSelect
				formats={[format]}
				onChange={jest.fn()}
				selectedFormat={format}
				{...props}
			>
				mock-label
			</StoryFormatSelect>
		);
	}

	it('shows only loaded formats', () => {
		const formats = [fakeLoadedStoryFormat(), fakeFailedStoryFormat()];

		renderComponent({formats, selectedFormat: formats[0]});

		const options = screen.getByRole('combobox').querySelectorAll('option');

		expect(options.length).toBe(1);
		expect(options[0].textContent).toBe(
			`${formats[0].name} ${formats[0].version}`
		);
	});

	it('shows a count of loading formats', () => {
		const formats = [fakeLoadedStoryFormat(), fakePendingStoryFormat()];

		renderComponent({formats, selectedFormat: formats[0]});

		const options = screen.getByRole('combobox').querySelectorAll('option');

		expect(options.length).toBe(2);
		expect(options[0].textContent).toBe(
			`${formats[0].name} ${formats[0].version}`
		);
		expect(options[1]).toBeDisabled();
		expect(options[1].textContent).toBe(
			'components.storyFormatSelect.loadingCount'
		);
	});

	it('selects the selected format', () => {
		const formats = [fakeLoadedStoryFormat(), fakePendingStoryFormat()];

		renderComponent({formats, selectedFormat: formats[0]});
		expect(screen.getByRole('combobox')).toHaveValue(formats[0].id);
	});

	it('calls the onChange prop when a format is selected', () => {
		const onChange = jest.fn();
		const formats = [fakeLoadedStoryFormat(), fakeLoadedStoryFormat()];

		renderComponent({formats, onChange, selectedFormat: formats[0]});
		expect(onChange).not.toHaveBeenCalled();
		fireEvent.change(screen.getByRole('combobox'), {
			target: {value: formats[1].id}
		});
		expect(onChange).toBeCalledTimes(1);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
