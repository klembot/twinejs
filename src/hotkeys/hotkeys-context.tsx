import * as React from 'react';
import {setPref, usePrefsContext} from '../store/prefs';
import {detectPlatform, Platform} from '../util/platform';
import {Command} from './commands.types';
import {commandCatalog} from './command-catalog';
import {findConflicts} from './conflicts';
import {eventToKeyString, normalizeKeyString} from './key-string';
import {resolveKeymap, ResolvedKeymap} from './resolve-keymap';
import {
	GLOBAL_SCOPE,
	isTextEntry,
	KEYBINDINGS_SCOPE,
	scopeChain
} from './scope';

export interface HotkeysContextProps {
	/**
	 * Commands registered by currently-mounted components.
	 */
	commands: Command[];
	keymap: ResolvedKeymap;
	platform: Platform;
	/**
	 * Registers a command and returns a function that unregisters it. The
	 * command is passed as a ref so that the dispatcher always sees the latest
	 * `run` and `enabled` without needing to re-register.
	 */
	registerCommand: (command: React.RefObject<Command>) => () => void;
	/**
	 * Sets the user's binding for a command. Passing undefined resets it to the
	 * default; passing an empty array unbinds it.
	 */
	setBinding: (commandId: string, bindings?: string[]) => void;
	/**
	 * Removes all of the user's overrides.
	 */
	resetAllBindings: () => void;
}

const noop = () => {};

export const HotkeysContext = React.createContext<HotkeysContextProps>({
	commands: [],
	keymap: {},
	platform: 'linux',
	registerCommand: () => noop,
	resetAllBindings: noop,
	setBinding: noop
});

HotkeysContext.displayName = 'Hotkeys';

export const useHotkeysContext = () => React.useContext(HotkeysContext);

export const HotkeysProvider: React.FC = props => {
	const {dispatch, prefs} = usePrefsContext();
	const [platform] = React.useState(detectPlatform);
	const registrations = React.useRef<React.RefObject<Command>[]>([]);
	const [, setRegistrationCount] = React.useState(0);

	const overrides = prefs.hotkeyOverrides ?? {};
	const keymap = React.useMemo(() => resolveKeymap(overrides), [overrides]);

	// Kept in a ref so that the keydown listener below never needs to be
	// re-attached, which would otherwise happen on every preference change.

	const keymapRef = React.useRef(keymap);

	keymapRef.current = keymap;

	const registerCommand = React.useCallback(
		(command: React.RefObject<Command>) => {
			registrations.current = [...registrations.current, command];
			setRegistrationCount(value => value + 1);

			return () => {
				registrations.current = registrations.current.filter(
					existing => existing !== command
				);
				setRegistrationCount(value => value + 1);
			};
		},
		[]
	);

	const setBinding = React.useCallback(
		(commandId: string, bindings?: string[]) => {
			const updated = {...(prefs.hotkeyOverrides ?? {})};

			if (bindings) {
				updated[commandId] = bindings;
			} else {
				delete updated[commandId];
			}

			dispatch(setPref('hotkeyOverrides', updated));
		},
		[dispatch, prefs.hotkeyOverrides]
	);

	const resetAllBindings = React.useCallback(
		() => dispatch(setPref('hotkeyOverrides', {})),
		[dispatch]
	);

	React.useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.defaultPrevented) {
				return;
			}

			const keyString = eventToKeyString(event, platform);

			if (!keyString) {
				return;
			}

			// The event target is where the key actually went, which is normally
			// the focused element. Falling back to activeElement covers events
			// dispatched at the document or body.

			const target =
				event.target instanceof Element && event.target !== document.body
					? event.target
					: document.activeElement;
			const inTextEntry = isTextEntry(target);
			const chain = scopeChain(target);

			// Inside the keyboard shortcuts list, scopeChain() returns that scope
			// alone so that looking a shortcut up can't trigger it. Window chrome
			// is exempt: maximizing the dialog you're reading isn't the same kind
			// of action as the ones being listed.

			const suppressed = chain.length === 1 && chain[0] === KEYBINDINGS_SCOPE;

			for (const scope of chain) {
				for (const registration of registrations.current) {
					const command = registration.current;

					if (!command) {
						continue;
					}

					const inScope =
						(command.scope || GLOBAL_SCOPE) === scope ||
						(suppressed && command.chrome);

					if (!inScope) {
						continue;
					}

					if (command.enabled === false) {
						continue;
					}

					if (inTextEntry && !command.allowInInput) {
						continue;
					}

					if (event.repeat && !command.allowRepeat) {
						continue;
					}

					if (
						command.element &&
						!(
							command.element.current &&
							target &&
							command.element.current.contains(target)
						)
					) {
						continue;
					}

					const bindings = keymapRef.current[command.id]?.bindings ?? [];

					if (
						!bindings.some(
							binding => normalizeKeyString(binding, platform) === keyString
						)
					) {
						continue;
					}

					event.preventDefault();
					command.run();
					return;
				}
			}
		}

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [platform]);

	// Warn about ambiguous keybindings during development.

	React.useEffect(() => {
		if (process.env.NODE_ENV === 'production') {
			return;
		}

		for (const conflict of findConflicts(commandCatalog, keymap, platform)) {
			console.warn(
				`Hotkey conflict: "${conflict.binding}" is bound to ` +
					`${conflict.commandIds.join(', ')} in scope "${conflict.scope}". ` +
					'Which one runs is not defined.'
			);
		}
	}, [keymap, platform]);

	const value = React.useMemo<HotkeysContextProps>(
		() => ({
			keymap,
			platform,
			registerCommand,
			resetAllBindings,
			setBinding,
			commands: registrations.current
				.map(registration => registration.current)
				.filter((command): command is Command => !!command)
		}),
		// The registration list is a ref, so it doesn't belong in this array. It
		// changes together with the state counter registerCommand updates, which
		// is what causes this to be recalculated.
		[keymap, platform, registerCommand, resetAllBindings, setBinding]
	);

	return (
		<HotkeysContext.Provider value={value}>
			{props.children}
		</HotkeysContext.Provider>
	);
};
