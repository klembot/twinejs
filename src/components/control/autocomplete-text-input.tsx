import * as React from 'react';
import {TextInput, TextInputProps} from './text-input';

// Invisible separator used to detect datalist selection, as opposed to the user
// typing into the field. Exported for testing only
export const DATALIST_SELECTION_MARKER = '\u2063';

export interface AutocompleteMetadata {
	autocompleted: boolean;
}

export interface AutocompleteTextInputProps
	extends Omit<TextInputProps, 'onChange'> {
	completions: string[];
	id: string;
	onChange?: (
		event: React.ChangeEvent<HTMLInputElement>,
		metadata: AutocompleteMetadata
	) => void;
}

export const AutocompleteTextInput = React.forwardRef<
	HTMLInputElement,
	AutocompleteTextInputProps
>((props, ref) => {
	// Isolate the onChange prop so spreading props on <TextInput> doesn't clobber
	// our own onChange handler.
	const { onChange, ...otherProps} = props;
	const datalistId = `${props.id}-datalist`;

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		if (!onChange) {
			return;
		}

		if (event.target.value.endsWith(DATALIST_SELECTION_MARKER)) {
			// User selected from datalist. Strip the marker and notify with metadata.

			event.target.value = event.target.value.slice(0, -1);
			onChange(event, {autocompleted: true});
			return;
		}

		onChange(event, {autocompleted: false});
	}

	function handleInput(event: React.FormEvent<HTMLInputElement>) {
		const target = event.target as HTMLInputElement;

		if (target.value.endsWith(DATALIST_SELECTION_MARKER)) {
			// The user picked an option from the autocomplete. Don't do any more
			// processing.

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

			props.onInput?.(event);
			return;
		}

		// Only autocomplete with exactly one match. Multiple matches would fill
		// the input with the first match and prevent the datalist dropdown from
		// showing all available options.

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
				onChange={handleChange}
				onInput={handleInput}
				ref={ref}
				{...otherProps}
			/>
			<datalist id={datalistId}>
				{props.completions.map(completion => (
					<option
						key={completion}
						value={completion + DATALIST_SELECTION_MARKER}
					/>
				))}
			</datalist>
		</>
	);
});
