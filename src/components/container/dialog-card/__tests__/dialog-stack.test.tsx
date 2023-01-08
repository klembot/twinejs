import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {DialogStack} from '../dialog-stack';

const TestChild = ({testId}: {testId: string}) => (
	<div key={testId} data-testid={testId} />
);

describe('<DialogStack>', () => {
	function renderComponent() {
		return render(
			<DialogStack
				children={[
					<TestChild testId="child1" />,
					<TestChild testId="child2" />
				]}
				childKeys={['child1', 'child2']}
			/>
		);
	}

	it('displays its children', () => {
		renderComponent();
		expect(screen.getByTestId('child1')).toBeInTheDocument();
		expect(screen.getByTestId('child2')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
