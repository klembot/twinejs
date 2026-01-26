import * as React from 'react';
import {usePopper} from 'react-popper';
import {CSSTransition} from 'react-transition-group';
import {ButtonBar} from '../../container/button-bar';
import {ButtonCard} from '../../container/button-card';
import {CloseAllPassagesButton} from '../../../routes/story-edit/toolbar/passage/close-all-passages-button';
import './passage-map-context-menu.css';

export interface PassageMapContextMenuHandle {
	close: () => void;
	open: (x: number, y: number) => void;
}

const PassageMapContextMenuContent = React.forwardRef<
	HTMLDivElement,
	{isOpen: boolean; onClose: () => void; x: number; y: number}
>(({isOpen, onClose, x, y}, ref) => {
	const [menuEl, setMenuEl] = React.useState<HTMLDivElement | null>(null);
	
	const virtualEl = React.useMemo(
		() => ({
			getBoundingClientRect: () => ({
				width: 0,
				height: 0,
				top: y,
				left: x,
				bottom: y,
				right: x
			})
		}),
		[x, y]
	);

	const {styles, attributes} = usePopper(virtualEl as any, menuEl, {
		strategy: 'fixed',
		placement: 'bottom-start'
	});

	// Sync the external ref with our internal state ref
	React.useEffect(() => {
		if (ref) {
			if (typeof ref === 'function') {
				ref(menuEl);
			} else {
				ref.current = menuEl;
			}
		}
	}, [menuEl, ref]);

	React.useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (menuEl && !menuEl.contains(event.target as Node)) {
				onClose();
			}
		};

		// Add a slight delay to avoid closing immediately after opening
		const timeoutId = setTimeout(() => {
			document.addEventListener('mousedown', handleClickOutside);
		}, 0);

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, menuEl, onClose]);

	return (
		<CSSTransition
			classNames="fade-out"
			in={isOpen}
			mountOnEnter
			timeout={10}
			unmountOnExit
		>
			<div
				className="passage-map-context-menu"
				ref={setMenuEl}
				style={styles.popper}
				{...attributes.popper}
			>
				<ButtonCard floating>
					<ButtonBar orientation="vertical">
					<CloseAllPassagesButton onClose={onClose} />
					</ButtonBar>
				</ButtonCard>
			</div>
		</CSSTransition>
	);
});

PassageMapContextMenuContent.displayName = 'PassageMapContextMenuContent';

export interface PassageMapContextMenuProps {}

export const PassageMapContextMenu = React.forwardRef<
	PassageMapContextMenuHandle,
	PassageMapContextMenuProps
>((props, ref) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [position, setPosition] = React.useState({x: 0, y: 0});
	const menuRef = React.useRef<HTMLDivElement>(null);

	const handleOpen = React.useCallback((x: number, y: number) => {
		setPosition({x, y});
		setIsOpen(true);
	}, []);

	const handleClose = React.useCallback(() => {
		setIsOpen(false);
	}, []);

	React.useImperativeHandle(ref, () => ({
		open: handleOpen,
		close: handleClose
	}));

	return (
		<PassageMapContextMenuContent
			isOpen={isOpen}
			onClose={handleClose}
			ref={menuRef}
			x={position.x}
			y={position.y}
		/>
	);
});

PassageMapContextMenu.displayName = 'PassageMapContextMenu';
