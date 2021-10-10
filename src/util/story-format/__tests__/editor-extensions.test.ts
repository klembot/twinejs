import {formatEditorExtensions} from '../editor-extensions';
import {
	fakeFailedStoryFormat,
	fakeLoadedStoryFormat,
	fakePendingStoryFormat,
	fakeUnloadedStoryFormat
} from '../../../test-util';

describe('formatEditorExtensions()', () => {
	it('returns undefined if the format is not loaded', () => {
		expect(
			formatEditorExtensions(fakeFailedStoryFormat(), '2.4.0')
		).toBeUndefined();
		expect(
			formatEditorExtensions(fakePendingStoryFormat(), '2.4.0')
		).toBeUndefined();
		expect(
			formatEditorExtensions(fakeUnloadedStoryFormat(), '2.4.0')
		).toBeUndefined();
	});

	it('returns undefined if the format has no editorExtensions property', () => {
		jest.spyOn(console, 'info').mockReturnValue();

		const format = fakeLoadedStoryFormat();

		delete (format as any).properties.editorExtensions;
		expect(formatEditorExtensions(format, '2.4.0')).toBeUndefined();
	});

	it('returns undefined if the format has no editorExtensions.twine property', () => {
		jest.spyOn(console, 'info').mockReturnValue();

		const format = fakeLoadedStoryFormat();

		(format as any).properties.editorExtensions = {};
		expect(formatEditorExtensions(format, '2.4.0')).toBeUndefined();
		(format as any).properties.editorExtensions = {
			someOtherTool: {'2.4.0': {}}
		};
		expect(formatEditorExtensions(format, '2.4.0')).toBeUndefined();
	});

	it('returns undefined if no version spec matches the Twine version', () => {
		jest.spyOn(console, 'info').mockReturnValue();
		const format = fakeLoadedStoryFormat();

		(format as any).properties.editorExtensions = {};
		expect(formatEditorExtensions(format, '2.4.0')).toBeUndefined();
		(format as any).properties.editorExtensions = {
			twine: {'^3.0.0': {}}
		};
		expect(formatEditorExtensions(format, '2.4.0')).toBeUndefined();
	});

	it('selects the appropriate set of extensions for the Twine version', () => {
		const warnSpy = jest.spyOn(console, 'warn').mockReturnValue();
		const format = fakeLoadedStoryFormat();

		(format as any).properties.editorExtensions = {
			twine: {
				'^1.0.0': {passed: false},
				'^2.0.0': {passed: true},
				'^3.0.0': {passed: false}
			}
		};
		expect((formatEditorExtensions(format, '2.4.0') as any).passed).toBe(true);
		expect(warnSpy).not.toBeCalled();
	});

	it('warns if more than one set of extensions matches the Twine version', () => {
		const warnSpy = jest.spyOn(console, 'warn').mockReturnValue();
		const format = fakeLoadedStoryFormat();

		(format as any).properties.editorExtensions = {
			twine: {
				'^2.0.0': {ambiguous: true},
				'^2.4.0': {ambiguous: true}
			}
		};

		expect((formatEditorExtensions(format, '2.4.0') as any).ambiguous).toBe(
			true
		);
		expect(warnSpy).toBeCalledTimes(1);
	});
});
