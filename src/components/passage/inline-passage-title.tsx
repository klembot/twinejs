import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {VisibleWhitespace} from '../visible-whitespace';
import {Passage, Story, updatePassage} from '../../store/stories';
import './inline-passage-title.css';
import classNames from 'classnames';
import { useUndoableStoriesContext } from '../../store/undoable-stories';

export interface InlinePassageTitleProps {
	disabled?: boolean;
	passage: Passage;
	story: Story;
}

export const InlinePassageTitle: React.FC<InlinePassageTitleProps> = props => {
	const {disabled, passage, story} = props;
	const {t} = useTranslation();
    const title = passage.name;
	const [editing, setEditing] = React.useState(false);
	const [editValue, setEditValue] = React.useState(title);
	const [error, setError] = React.useState<string>();
	const inputRef = React.useRef<HTMLInputElement>(null);
    const {dispatch} = useUndoableStoriesContext();

	React.useEffect(() => {
		if (editing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [editing]);

	// Keep editValue in sync if the passage name changes externally while not editing.
	React.useEffect(() => {
		if (!editing) {
			setEditValue(title);
		}
	}, [editing, title]);

	function validate(name: string): string | undefined {
		if (name.trim() === '') {
			return t('components.renamePassageButton.emptyName');
		}

		if (
			story.passages.some(p => p.id !== passage.id && p.name === name)
		) {
			return t('components.renamePassageButton.nameAlreadyUsed');
		}

		return undefined;
	}

	function handleDoubleClick(event: React.MouseEvent) {
		if (disabled) {
			return;
		}

		event.stopPropagation();
		setEditing(true);
		setEditValue(title);
		setError(undefined);
	}

	function handleSubmit() {
		const validationError = validate(editValue);

		if (validationError) {
			setError(validationError);
			return;
		}

		setEditing(false);
		setError(undefined);

		if (editValue !== title) {
            // Don't create newly linked passages here because the update action will
            // try to recreate the passage as it's been renamed--it sees new links in
            // existing passages, updates them, but does not see that the passage name
            // has been updated since that hasn't happened yet.

            dispatch(updatePassage(story, passage, {name: editValue}, {dontUpdateOthers: true}));
		}
	}

	function handleCancel() {
		setEditing(false);
		setEditValue(title);
		setError(undefined);
	}

	function handleKeyDown(event: React.KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			event.stopPropagation();
			handleSubmit();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			handleCancel();
		}
	}

	if (editing) {
		return (
			<span className="inline-passage-title-wrapper">
				<input
					ref={inputRef}
					aria-label={t('common.rename')}
					className={classNames(
						'inline-passage-title',
						{'has-error': error}
					)}
					onBlur={handleSubmit}
					onChange={event => {
						setEditValue(event.target.value);
						setError(undefined);
					}}
					onKeyDown={handleKeyDown}
					value={editValue}
				/>
				{error && (
					<span className="inline-passage-title-error" role="alert">
						<span className="inline-passage-title-error-arrow" />
						{error}
					</span>
				)}
			</span>
		);
	}

	return (
		<>
			<VisibleWhitespace
                value={title}
                title={disabled ? undefined : t('common.rename')}
                onDoubleClick={handleDoubleClick}
            />
		</>
	);
};
