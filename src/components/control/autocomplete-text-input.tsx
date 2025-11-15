import * as React from 'react';
import {TextInput, TextInputProps} from './text-input';

export interface AutocompleteTextInputProps extends TextInputProps {
	completions: string[];
}

let uniqueIdCounter = 0;

export const AutocompleteTextInput = React.forwardRef<
	HTMLInputElement,
	AutocompleteTextInputProps
>((props, ref) => {
	const datalistId = React.useMemo(
		() => `autocomplete-datalist-${++uniqueIdCounter}`,
		[]
	);

	function handleInput(event: React.FormEvent<HTMLInputElement>) {
		const target = event.target as HTMLInputElement;

		if (
			target.value === '' ||
			!(event.nativeEvent as InputEvent).data ||
			target.selectionStart !== target.selectionEnd ||
			target.selectionStart !== target.value.length
		) {
			// If...
			//  - the field is now blank
			//  - the user entered a non-printable character (like pressed an arrow key)
			//  - the cursor isn't at the end of the field
			// ... don't try to autocomplete anything.

			return;
		}

		const match = props.completions.find(completion =>
			completion.startsWith(target.value)
		);

		if (match) {
			// Set the input value to the match and select the part the user
			// didn't enter.

			const originalValue = target.value;

			target.value = match;
			target.setSelectionRange(originalValue.length, match.length);
		}

		props.onInput?.(event);
	}

	return (
		<>
			<TextInput
				// Disable browser autofill so only datalist options appear (no email/address suggestions)
				autoComplete="off"
				list={datalistId}
				onInput={handleInput}
				ref={ref}
				{...props}
			/>
			<datalist id={datalistId}>
				{props.completions.map(completion => (
					<option key={completion} value={completion} />
				))}
			</datalist>
		</>
	);
});
