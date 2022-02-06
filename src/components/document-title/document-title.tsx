import * as React from 'react';
import {Helmet} from 'react-helmet';
import {isElectronRenderer} from '../../util/is-electron';

export interface DocumentTitleProps {
	title: string;
}

/**
 * Sets the document title. This works around a bug with Electron and may not be
 * needed in later versions.
 */
export const DocumentTitle: React.FC<DocumentTitleProps> = ({title}) => {
	// Using `history.goBack()` doesn't seem to cause Electron to update the
	// window title bar--possibly tied to using a <HashRouter>. If it does in a
	// future version, we can just use react-helmet directly.

	React.useEffect(() => {
		if (isElectronRenderer()) {
			const timeout = window.setTimeout(() => {
				document.querySelector('title')!.innerHTML = title;
			}, 0);

			return () => window.clearTimeout(timeout);
		}
	}, [title]);

	return (
		<Helmet>
			<title>{title}</title>
		</Helmet>
	);
};
