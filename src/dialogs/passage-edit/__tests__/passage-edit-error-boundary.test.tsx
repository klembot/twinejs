import {fireEvent, render, screen} from '@testing-library/react';
import * as React from 'react';
import {
	PassageEditErrorBoundary,
	PassageEditErrorBoundaryProps
} from '../passage-edit-error-boundary';

const TestError: React.FC = () => {
	const [error, setError] = React.useState(false);

	if (error) {
		throw new Error();
	}

	return <button onClick={() => setError(true)}>test error</button>;
};

describe('<PassageEditErrorBoundary>', () => {
	function renderComponent(props?: Partial<PassageEditErrorBoundaryProps>) {
		return render(
			<PassageEditErrorBoundary onError={jest.fn()} {...props}>
				<TestError />
			</PassageEditErrorBoundary>
		);
	}

	it('displays its children', () => {
		renderComponent();
		expect(screen.getByRole('button')).toBeInTheDocument();
	});

	it('calls its onError prop if a child throws an error', () => {
		jest.spyOn(console, 'error').mockReturnValue();

		const onError = jest.fn();

		renderComponent({onError});
		expect(onError).not.toBeCalled();
		fireEvent.click(screen.getByRole('button'));
		expect(onError).toBeCalledTimes(1);
	});
});
