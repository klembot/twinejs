import * as React from 'react';

export interface PassageEditErrorBoundaryProps {
	children: React.ReactElement;
	onError: (error: Error) => void;
}

export class PassageEditErrorBoundary extends React.Component<
	PassageEditErrorBoundaryProps,
	{}
> {
	public componentDidCatch(error: Error) {
		this.props.onError(error);
	}

	public render() {
		return this.props.children;
	}
}
