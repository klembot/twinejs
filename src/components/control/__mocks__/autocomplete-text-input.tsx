import * as React from 'react';
import {AutocompleteTextInputProps} from '../autocomplete-text-input';
import {TextInput} from '../text-input';

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
				<option key={completion} value={completion} />
			))}
		</datalist>
	</>
);
