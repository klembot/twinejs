import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	fakeLoadedStoryFormat,
	FakeStateProvider,
	PrefInspector
} from '../../../test-util';
import {StoryFormatsDialog} from '../story-formats';
import {StoryFormat} from '../../../store/story-formats';
import {PrefsState} from '../../../store/prefs';

jest.mock(
	'../../../components/story-format/story-format-item/story-format-item'
);

describe('<StoryFormatsDialog>', () => {
	function renderComponent(
		formats: StoryFormat[] = [],
		prefs?: Partial<PrefsState>
	) {
		return render(
			<FakeStateProvider prefs={prefs} storyFormats={formats}>
				<StoryFormatsDialog
					collapsed={false}
					onChangeCollapsed={jest.fn()}
					onChangeHighlighted={jest.fn()}
					onChangeMaximized={jest.fn()}
					onClose={jest.fn()}
				/>
				<PrefInspector name="disabledStoryFormatEditorExtensions" />
				<PrefInspector name="proofingFormat" />
				<PrefInspector name="storyFormat" />
			</FakeStateProvider>
		);
	}

	afterEach(async () => {
		await act(() => Promise.resolve());
	});

	it('shows all formats when the view preference is all', () => {
		const format1 = fakeLoadedStoryFormat();
		const format2 = fakeLoadedStoryFormat();

		format1.version = '1.0.0';
		format2.name = format1.name;
		format2.version = '1.0.1';
		renderComponent([format1, format2], {storyFormatListFilter: 'all'});

		const items = screen.getAllByTestId('mock-story-format-item');

		expect(items.length).toBe(2);
		expect(items.some(item => item.dataset.formatId === format1.id)).toBe(true);
		expect(items.some(item => item.dataset.formatId === format2.id)).toBe(true);
	});

	it('only shows user-added formats when the view preference is user', () => {
		const format1 = fakeLoadedStoryFormat({userAdded: true});
		const format2 = fakeLoadedStoryFormat({userAdded: false});

		renderComponent([format1, format2], {storyFormatListFilter: 'user'});

		const items = screen.getAllByTestId('mock-story-format-item');

		expect(items.length).toBe(1);
		expect(items.some(item => item.dataset.formatId === format1.id)).toBe(true);
		expect(items.some(item => item.dataset.formatId === format2.id)).toBe(
			false
		);
	});

	it('only shows the most current version of a format iof the view preference is current', () => {
		const format1 = fakeLoadedStoryFormat();
		const format2 = fakeLoadedStoryFormat();
		const format3 = fakeLoadedStoryFormat();

		format1.version = '1.0.0';
		format2.name = format1.name;
		format2.version = '1.0.1';
		renderComponent([format1, format2, format3], {
			storyFormatListFilter: 'current'
		});
		expect((format3 as any).properties.name).not.toBe(
			(format1 as any).properties.name
		);

		const items = screen.getAllByTestId('mock-story-format-item');

		expect(items.length).toBe(2);
		expect(items.some(item => item.dataset.formatId === format1.id)).toBe(
			false
		);
		expect(items.some(item => item.dataset.formatId === format2.id)).toBe(true);
		expect(items.some(item => item.dataset.formatId === format3.id)).toBe(true);
	});

	it('shows a message if no formats are visible', () => {
		renderComponent([fakeLoadedStoryFormat({userAdded: false})], {
			storyFormatListFilter: 'user'
		});
		expect(
			screen.getByText('dialogs.storyFormats.noneVisible')
		).toBeInTheDocument();
		expect(
			screen.queryByTestId('mock-story-format-item')
		).not.toBeInTheDocument();
	});

	it('marks the default format', () => {
		const format = fakeLoadedStoryFormat();

		renderComponent([format], {
			storyFormat: {name: format.name, version: format.version}
		});
		expect(
			screen.getByTestId('mock-story-format-item').dataset.defaultFormat
		).toBe('true');
	});

	it('marks the proofing format', () => {
		const format = fakeLoadedStoryFormat();

		renderComponent([format], {
			proofingFormat: {name: format.name, version: format.version}
		});
		expect(
			screen.getByTestId('mock-story-format-item').dataset.proofingFormat
		).toBe('true');
	});

	it('leaves other formats unmarked', () => {
		const format = fakeLoadedStoryFormat();

		renderComponent([format], {
			proofingFormat: {
				name: format.name + 'other',
				version: format.version + 'other'
			}
		});

		const item = screen.getByTestId('mock-story-format-item');

		expect(item.dataset.defaultFormat).toBe('false');
		expect(item.dataset.proofingFormat).toBe('false');
	});

	it('deletes a format when the delete button is clicked on an item', () => {
		const format1 = fakeLoadedStoryFormat();
		const format2 = fakeLoadedStoryFormat();

		renderComponent([format1, format2]);

		const items = screen.getAllByTestId('mock-story-format-item');

		expect(items.length).toBe(2);

		const toDelete = items.find(item => item.dataset.formatId === format1.id);

		if (!toDelete) {
			throw new Error("Couldn't find first format in DOM");
		}

		fireEvent.click(within(toDelete).getByRole('button', {name: 'onDelete'}));
		expect(screen.getAllByTestId('mock-story-format-item').length).toBe(1);
		expect(screen.getByTestId('mock-story-format-item').dataset.formatId).toBe(
			format2.id
		);
	});

	it('disables editor extensions when the checkbox is clicked on an item', () => {
		const format = fakeLoadedStoryFormat();

		renderComponent([format], {
			disabledStoryFormatEditorExtensions: []
		});

		expect(
			screen.getByTestId('pref-inspector-disabledStoryFormatEditorExtensions')
		).toHaveTextContent('[]');
		fireEvent.click(screen.getByText('onChangeEditorExtensionsDisabled true'));
		expect(
			screen.getByTestId('pref-inspector-disabledStoryFormatEditorExtensions')
		).toHaveTextContent(
			JSON.stringify([{name: format.name, version: format.version}])
		);
	});

	it('enables editor extensions when the checkbox is clicked on an item', () => {
		const format = fakeLoadedStoryFormat();

		renderComponent([format], {
			disabledStoryFormatEditorExtensions: [
				{name: format.name, version: format.version},
				{name: 'other', version: '1.0.0'}
			]
		});

		fireEvent.click(screen.getByText('onChangeEditorExtensionsDisabled false'));
		expect(
			screen.getByTestId('pref-inspector-disabledStoryFormatEditorExtensions')
		).toHaveTextContent(JSON.stringify([{name: 'other', version: '1.0.0'}]));
	});

	it('updates preferences when a format is selected as default', () => {
		const format = fakeLoadedStoryFormat();

		renderComponent([format]);
		fireEvent.click(screen.getByText('onUseAsDefault'));
		expect(screen.getByTestId('pref-inspector-storyFormat')).toHaveTextContent(
			JSON.stringify({name: format.name, version: format.version})
		);
	});

	it('updates preferences when a format is selected as proofing', () => {
		const format = fakeLoadedStoryFormat();

		renderComponent([format]);
		fireEvent.click(screen.getByText('onUseAsProofing'));
		expect(
			screen.getByTestId('pref-inspector-proofingFormat')
		).toHaveTextContent(
			JSON.stringify({name: format.name, version: format.version})
		);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
