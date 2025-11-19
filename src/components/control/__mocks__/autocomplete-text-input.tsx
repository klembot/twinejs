import * as React from 'react';
import type {AutocompleteTextInputProps} from '../autocomplete-text-input';
import {TextInput} from '../text-input';

// Invisible separator used to detect datalist selection. Also defined here to prevent circular dependency.
const DATALIST_SELECTION_MARKER = '\u2063';

export const AutocompleteTextInput: React.FC<AutocompleteTextInputProps> = ({
	children,
	completions,
	id,
	...rest
}) => (
	<>
		<TextInput id={id} list={`${id}-datalist`} {...rest}>
			<span data-completions={JSON.stringify(completions)}>{children}</span>
		</TextInput>
		<datalist id={`${id}-datalist`}>
			{completions.map(completion => (
				<option
					key={completion}
					value={completion + DATALIST_SELECTION_MARKER}
				/>
			))}
		</datalist>
	</>
);
