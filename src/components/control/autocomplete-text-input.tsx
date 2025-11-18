import * as React from 'react';
import {TextInput, TextInputProps} from './text-input';

export interface AutocompleteTextInputProps extends TextInputProps {
	completions: string[];
	id: string;
	onSelect?: (value: string) => void;
}

export const AutocompleteTextInput = React.forwardRef<
	HTMLInputElement,
	AutocompleteTextInputProps
>((props, ref) => {
	const datalistId = `${props.id}-datalist`;

	function handleInput(event: React.FormEvent<HTMLInputElement>) {
		const target = event.target as HTMLInputElement;

		// Detect datalist selection via invisible separator (U+2063)
		if (target.value.endsWith('\u2063')) {
			const cleanValue = target.value.slice(0, -1);
			target.value = cleanValue;
			props.onSelect?.(cleanValue);
			props.onInput?.(event);
			return;
		}

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

		// Only autocomplete when there's exactly one match to avoid
		// conflicts with the datalist dropdown
		const matches = props.completions.filter(completion =>
			completion.toLowerCase().startsWith(target.value.toLowerCase())
		);

		if (matches.length === 1) {
			// Set the input value to the match and select the part the user
			// didn't enter.

			const originalValue = target.value;

			target.value = matches[0];
			target.setSelectionRange(originalValue.length, matches[0].length);
		}

		props.onInput?.(event);
	}

	return (
		<>
			<TextInput
				list={datalistId}
				onInput={handleInput}
				ref={ref}
				{...props}
			/>
			<datalist id={datalistId}>
				{props.completions.map(completion => (
					<option key={completion} value={completion + '\u2063'} />
				))}
			</datalist>
		</>
	);
});
