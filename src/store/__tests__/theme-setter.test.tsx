import {ThemeSetter} from '../theme-setter';
import {render} from '@testing-library/react';
import {useComputedTheme} from '../prefs/use-computed-theme';

jest.mock('../prefs/use-computed-theme');

describe('<ThemeSetter>', () => {
	const useComputedThemeMock = useComputedTheme as jest.Mock;

	it("sets the body tag's dataset-app-theme property based on the computed theme", () => {
		useComputedThemeMock.mockReturnValue('light');
		render(<ThemeSetter />);
		expect(document.body.dataset.appTheme).toBe('light');
		useComputedThemeMock.mockReturnValue('dark');
		render(<ThemeSetter />);
		expect(document.body.dataset.appTheme).toBe('dark');
	});
});
