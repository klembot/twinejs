import {render} from '@testing-library/react';
import {SafariWarningCard} from '../safari-warning-card';

describe('<SafariWarningCard>', () => {
	afterEach(() => delete (window.navigator as any).standalone);

	function renderWithUserAgent(agent: string, standalone: boolean = false) {
		if (standalone) {
			(window.navigator as any).standalone = standalone;
		}

		jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(agent);
		return render(<SafariWarningCard />);
	}

	it('renders nothing if the user agent is not Safari', () =>
		expect(
			renderWithUserAgent(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
			).container.innerHTML
		).toBe(''));

	it('renders nothing if the user agent is Safari version 12 or earlier', () =>
		expect(
			renderWithUserAgent(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15'
			).container.innerHTML
		).toBe(''));

	it('renders nothing if the user agent is Safari version 13 or later, but the app is running in standalone mode', () =>
		expect(
			renderWithUserAgent(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.2 Safari/605.1.15',
				true
			).container.innerHTML
		).toBe(''));

	it('renders in Safari version 13 and later', () =>
		expect(
			renderWithUserAgent(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.2 Safari/605.1.15'
			).container.innerHTML
		).not.toBe(''));
});
