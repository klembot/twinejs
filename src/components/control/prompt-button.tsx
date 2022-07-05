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
	extends Omit<CardButtonProps, 'ariaLabel' | 'onChangeOpen' | 'open'> {
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
	const mounted = React.useRef(true);
	const [open, setOpen] = React.useState(false);
	const [validation, setValidation] =
		React.useState<PromptValidationResponse>();
	const {t} = useTranslation();

	React.useEffect(() => {
		async function updateValidation() {
			if (validate) {
				const validation = await validate(value);

				if (mounted.current) {
					setValidation(validation);
				}
			} else {
				if (mounted.current) {
					setValidation({valid: true});
				}
			}
		}

		updateValidation();
	}, [validate, value]);

	React.useEffect(() => {
		return () => {
			mounted.current = false;
		};
	}, []);

	function handleCancel(event: React.MouseEvent) {
		event.preventDefault();
		setOpen(false);
	}

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();

		// It's possible to submit with the Enter key and bypass us disabling the
		// submit button, so we need to catch that here.

		if (validation?.valid) {
			onSubmit(value);
			setOpen(false);
		}
	}

	return (
		<span className="prompt-button">
			<CardButton
				ariaLabel={prompt}
				onChangeOpen={setOpen}
				open={open}
				{...other}
			>
				<form onSubmit={handleSubmit}>
					<CardContent>
						<TextInput onChange={onChange} orientation="vertical" value={value}>
							{prompt}
						</TextInput>
						{validation?.message && <p>{validation.message}</p>}
					</CardContent>
					<ButtonBar>
						<IconButton
							buttonType="submit"
							disabled={!validation?.valid}
							icon={submitIcon ?? <IconCheck />}
							label={submitLabel ?? t('common.ok')}
							variant={submitVariant ?? 'primary'}
						/>
						<IconButton
							buttonType="button"
							icon={cancelIcon ?? <IconX />}
							label={cancelLabel ?? t('common.cancel')}
							onClick={handleCancel}
						/>
					</ButtonBar>
				</form>
			</CardButton>
		</span>
	);
};
