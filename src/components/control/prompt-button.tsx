import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconCheck, IconX} from '@tabler/icons';
import {ButtonBar} from '../container/button-bar';
import {CardContent} from '../container/card';
import {CardButton, CardButtonProps} from './card-button';
import {IconButton, IconButtonProps} from './icon-button';
import {TextInput} from './text-input';

export interface PromptValidationResponse {
	message?: string;
	valid: boolean;
}

export type PromptButtonValidator = (
	value: string
) => PromptValidationResponse | Promise<PromptValidationResponse>;

export interface PromptButtonProps
	extends Omit<CardButtonProps, 'onChangeOpen' | 'open'> {
	cancelIcon?: React.ReactNode;
	cancelLabel?: string;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	onSubmit: (value: string) => void;
	prompt: string;
	submitIcon?: React.ReactNode;
	submitLabel?: string;
	submitVariant?: IconButtonProps['variant'];
	validate?: PromptButtonValidator;
	value: string;
}

export const PromptButton: React.FC<PromptButtonProps> = props => {
	const {
		cancelIcon,
		cancelLabel,
		onChange,
		onSubmit,
		prompt,
		submitIcon,
		submitLabel,
		submitVariant,
		validate,
		value,
		...other
	} = props;
	const [open, setOpen] = React.useState(false);
	const [
		validation,
		setValidation
	] = React.useState<PromptValidationResponse>();
	const {t} = useTranslation();

	React.useEffect(() => {
		async function updateValidation() {
			if (validate) {
				setValidation(await validate(value));
			} else {
				setValidation({valid: true});
			}
		}

		updateValidation();
	}, [validate, value]);

	function handleSubmit() {
		onSubmit(value);
		setOpen(false);
	}

	return (
		<span className="prompt-button">
			<CardButton onChangeOpen={setOpen} open={open} {...other}>
				<CardContent>
					<TextInput onChange={onChange} orientation="vertical" value={value}>
						{prompt}
					</TextInput>
					{validation?.message && <p>{validation.message}</p>}
				</CardContent>
				<ButtonBar>
					<IconButton
						disabled={!validation?.valid}
						icon={submitIcon ?? <IconCheck />}
						label={submitLabel ?? t('common.ok')}
						onClick={handleSubmit}
						variant={submitVariant ?? 'primary'}
					/>
					<IconButton
						icon={cancelIcon ?? <IconX />}
						label={cancelLabel ?? t('common.cancel')}
						onClick={() => setOpen(false)}
					/>
				</ButtonBar>
			</CardButton>
		</span>
	);
};
