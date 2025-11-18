import * as React from 'react';
import {AutocompleteTextInputProps} from '../autocomplete-text-input';
import {TextInput} from '../text-input';

export const AutocompleteTextInput: React.FC<AutocompleteTextInputProps> = ({
	children,
	completions,
	id,
	onSelect,
	...rest
}) => {
	function handleInput(event: React.FormEvent<HTMLInputElement>) {
		const target = event.target as HTMLInputElement;

		// Check if user selected from datalist (value ends with invisible separator)
		if (target.value.endsWith('\u2063')) {
			const cleanValue = target.value.slice(0, -1);
			target.value = cleanValue;
			onSelect?.(cleanValue);
		}

		rest.onInput?.(event);
	}

	return (
		<>
			<TextInput id={id} list={`${id}-datalist`} {...rest} onInput={handleInput}>
				<span data-completions={JSON.stringify(completions)}>{children}</span>
			</TextInput>
			<datalist id={`${id}-datalist`}>
				{completions.map(completion => (
					<option key={completion} value={completion + '\u2063'} />
				))}
			</datalist>
		</>
	);
};
