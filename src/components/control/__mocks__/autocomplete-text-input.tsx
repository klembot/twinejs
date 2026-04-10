import * as React from 'react';
import type {AutocompleteTextInputProps} from '../autocomplete-text-input';
import {TextInput} from '../text-input';

export const AutocompleteTextInput: React.FC<AutocompleteTextInputProps> = ({
	children,
	completions,
	id,
	onChange,
	...rest
}) => (
	<TextInput id={id} list={`${id}-datalist`} onChange={event => onChange?.(event, {autocompleted: false})} {...rest}>
		<span data-completions={JSON.stringify(completions)}>{children}</span>
	</TextInput>
);
