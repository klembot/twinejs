import {render, screen} from '@testing-library/react';
import * as React from 'react';
import {GlobalErrorBoundary} from '../global-error-boundary';

const ErrorComponent: React.FC = () => {
	throw new Error('mock-error');
};

describe('<GlobalErrorBoundary>', () => {
	it('renders children', () => {
		render(<GlobalErrorBoundary>no error</GlobalErrorBoundary>);
		expect(screen.getByText('no error')).toBeInTheDocument();
	});

	it('shows an error message if a child component throws an error', () => {
		jest.spyOn(console, 'error').mockReturnValue();

		render(
			<GlobalErrorBoundary>
				<ErrorComponent />
			</GlobalErrorBoundary>
		);
		expect(
			screen.getByText('Something went wrong', {exact: false})
		).toBeInTheDocument();
	});
});
