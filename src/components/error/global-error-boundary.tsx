import * as React from 'react';
import useErrorBoundary from 'use-error-boundary';
import {ErrorMessage} from './error-message';
import './global-error-boundary.css';

export const GlobalErrorBoundary: React.FC = ({children}) => {
	const {ErrorBoundary, didCatch, error} = useErrorBoundary();

	// Non-localized because our localization might be broken.

	return didCatch ? (
		<div className="global-error-boundary">
			<div>
				<ErrorMessage>
					<p>Something went wrong and Twine can't continue.</p>
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
				</ErrorMessage>
				<p>Details:</p>
				<pre>{error.stack}</pre>
			</div>
		</div>
	) : (
		<ErrorBoundary>{children}</ErrorBoundary>
	);
};