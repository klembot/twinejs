import * as React from 'react';
import './global-error-boundary.css';

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
		// Non-localized because our localization might be broken.

		if (this.state.error) {
			return (
				<div className="global-error-boundary">
					<div>
						<p className="fuuu" aria-hidden>
							💔
						</p>
						<p>An unrecoverable error has occurred.</p>
						<p>Please try restarting Twine or reloading the page.</p>
						<p>
							If you see this message repeatedly, please{' '}
							<a
								href="https://twinery.org/2bugs"
								rel="noreferrer"
								target="_blank"
							>
								report a bug
							</a>
							.
						</p>
						<p>Details:</p>
						<pre>{this.state.error.stack}</pre>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
