import * as React from 'react';

// TODO make this user-friendly

export interface GlobalErrorBoundaryState {
	error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<
	{},
	GlobalErrorBoundaryState
> {
	constructor(props: {}) {
		super(props);
		this.state = {error: null};
	}

	public static getDerivedStateFromError(error: Error) {
		// Update state so the next render will show the fallback UI.
		console.error(error);
		return {error};
	}

	public render() {
		if (this.state.error) {
			return <p>An error occurred: {this.state.error.message}</p>;
		}

		return this.props.children;
	}
}
