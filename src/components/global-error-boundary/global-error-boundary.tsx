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

	static getDerivedStateFromError(error: Error) {
		// Update state so the next render will show the fallback UI.
		console.warn(error);
		return {error};
	}

	render() {
		if (this.state.error) {
			return <p>An error occurred: {this.state.error}</p>;
		}

		return this.props.children;
	}
}
