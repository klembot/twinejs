import * as React from 'react';
import {AutocompleteTextInputProps} from '../autocomplete-text-input';
import {TextInput} from '../text-input';

export const AutocompleteTextInput: React.FC<AutocompleteTextInputProps> = ({
	children,
	completions,
	...rest
}) => (
	<TextInput {...rest}>
		<span data-completions={JSON.stringify(completions)}>{children}</span>
	</TextInput>
);
