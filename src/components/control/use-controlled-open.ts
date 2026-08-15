import * as React from 'react';

/**
 * Manages the open state of a popover-style button which is usually
 * uncontrolled, but which a parent can drive if it needs to--e.g. to open a
 * rename prompt from a keyboard shortcut.
 *
 * If `open` is undefined, state is kept internally. If it's set, the parent
 * owns it and is responsible for reacting to `onChangeOpen`.
 */
export function useControlledOpen(
	open?: boolean,
	onChangeOpen?: (value: boolean) => void
): [boolean, (value: boolean) => void] {
	const [internalOpen, setInternalOpen] = React.useState(false);
	const controlled = open !== undefined;
	const setOpen = React.useCallback(
		(value: boolean) => {
			if (!controlled) {
				setInternalOpen(value);
			}

			onChangeOpen?.(value);
		},
		[controlled, onChangeOpen]
	);

	return [controlled ? open : internalOpen, setOpen];
}
