import * as React from 'react';
import {TextInput, TextInputProps} from './text-input';

export interface AutocompleteTextInputProps extends TextInputProps {
	completions: string[];
}

export const AutocompleteTextInput = React.forwardRef<
	HTMLInputElement,
	AutocompleteTextInputProps
>((props, ref) => {
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
			// Set the input value to the match and select the part the user didn't enter.

			const originalValue = target.value;

			target.value = match;
			target.setSelectionRange(originalValue.length, match.length);
		}

		props.onInput?.(event);
	}

	return <TextInput onInput={handleInput} ref={ref} {...props} />;
});
