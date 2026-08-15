import * as React from 'react';
import {Command} from './commands.types';
import {useHotkeysContext} from './hotkeys-context';

/**
 * Publishes a command so that it can be run from a keyboard shortcut. The
 * component keeps its existing click handler; this only makes it reachable.
 *
 * ```tsx
 * const handleClick = React.useCallback(() => { ... }, [...]);
 *
 * useCommand({
 * 	id: 'passage.create',
 * 	label: t('common.new'),
 * 	run: handleClick,
 * 	scope: 'story-map'
 * });
 * ```
 *
 * What key the command is bound to is decided in `default-keymap.ts` and can
 * be changed by the user, so nothing here mentions a key.
 */
export function useCommand(command: Command): void {
	const {registerCommand} = useHotkeysContext();
	const commandRef = React.useRef(command);

	// Updated on every render so that the dispatcher sees current state--this
	// deliberately doesn't re-register the command.

	commandRef.current = command;

	const {id, scope} = command;

	React.useEffect(
		() => {
			if (scope === null) {
				return;
			}

			return registerCommand(commandRef);
		},
		// commandRef is a ref, so it doesn't belong in this array. `id` and
		// `scope` are listed so that a component which changes either
		// re-registers, which keeps registration order sensible.
		[id, registerCommand, scope]
	);
}
