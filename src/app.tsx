import * as React from 'react';
import {GlobalErrorBoundary} from './components/global-error-boundary';
import {LocaleSwitcher} from './store/locale-switcher';
import {PrefsContextProvider} from './store/prefs';
import {Routes} from './routes';
import {StoriesContextProvider} from './store/stories';
import {StoryFormatsContextProvider} from './store/story-formats';
import {StateLoader} from './store/state-loader';
import 'focus-visible';
import './styles/typography.css';
import './styles/focus-visible-shim.css';

export const App: React.FC = () => {
	return (
		<GlobalErrorBoundary>
			<PrefsContextProvider>
				<LocaleSwitcher />
				<StoryFormatsContextProvider>
					<StoriesContextProvider>
						<StateLoader>
							<React.Suspense
								fallback={<p>TODO loading locale</p>}
							>
								<Routes />
							</React.Suspense>
						</StateLoader>
					</StoriesContextProvider>
				</StoryFormatsContextProvider>
			</PrefsContextProvider>
		</GlobalErrorBoundary>
	);
};
