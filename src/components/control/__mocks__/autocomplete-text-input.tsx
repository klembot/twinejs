import * as React from 'react';
import {AutocompleteTextInputProps} from '../autocomplete-text-input';
import {TextInput} from '../text-input';

export const AutocompleteTextInput: React.FC<AutocompleteTextInputProps> = ({
	children,
	completions,
	...rest
}) => (
	<>
		<TextInput list="mock-datalist-id" {...rest}>
			<span data-completions={JSON.stringify(completions)}>{children}</span>
		</TextInput>
		<datalist id="mock-datalist-id">
			{completions.map(completion => (
				<option key={completion} value={completion} />
			))}
		</datalist>
	</>
);
