import classnames from 'classnames';
import * as React from 'react';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {DialogStackExpander} from './dialog-stack-expander';
import './dialog-stack.css';

export interface DialogStackProps {
	/**
	 * Children must be <DialogCard>s or <BackgroundDialogCard>s. Order in the
	 * array is topmost to bottom as displayed. We do this to make it easy to
	 * clamp the number of children; truncating the end means the furthest back
	 * are removed.
	 */
	children: React.ReactNode[];
	/**
	 * Keys to apply to the children to prevent spurious transitions.
	 */
	childKeys: string[];
}

/**
 * Maximum number of expanded dialogs. More than this will cause the last
 * remaining slot to be used as overflow.
 */
const maxExpandedDialogs = 3;

// Saves some parenthesis counting in the styles below.
const headerHeight = 'var(--control-height)';

export const DialogStack: React.FC<DialogStackProps> = ({
	children,
	childKeys
}) => {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const [expanded, setExpanded] = React.useState(false);

	// We need to reverse the order of children for rendering so that tab order is
	// correct. Meaning--the further in the background a dialog is, the earlier it
	// needs to be rendered. This has a side effect of also not needing us to
	// calculate z indices, since absolutely-positioned elements later in the DOM
	// appear above earlier ones.
	//
	// These are separately memoized because children may change while childKeys
	// remains the same.

	const childrenInRenderOrder = React.useMemo(
		() => [...children].reverse(),
		[children]
	);
	const childKeysInRenderOrder = React.useMemo(
		() => [...childKeys].reverse(),
		[childKeys]
	);

	// Remember the last change in childKeys.

	const lastChildKeysInRenderOrder = React.useRef<string[]>();

	React.useEffect(() => {
		lastChildKeysInRenderOrder.current = childKeysInRenderOrder;
	}, [childKeysInRenderOrder]);

	// The foreground dialog should have a rising animation applied to it if:
	// - The number of dialogs has not changed, but
	// - The foreground dialog key has changed
	//
	// In other words, if the dialogs have been reordered in-place.
	const foregroundIsRising = React.useMemo(
		() =>
			childKeysInRenderOrder.length ===
				lastChildKeysInRenderOrder.current?.length &&
			childKeysInRenderOrder[childKeysInRenderOrder.length - 1] !==
				lastChildKeysInRenderOrder.current?.[childKeysInRenderOrder.length - 1],
		[childKeysInRenderOrder]
	);

	// How many dialog card headers will be fully visible.
	const visibleLength = Math.min(children.length, maxExpandedDialogs);

	// Do we have overflowed dialogs?
	const stackHasOverflow = children.length > visibleLength;

	// The height of a single dialog card header in the overflow area, where
	// headers are not completely visible.
	const overflowHeaderHeight = `${headerHeight} / ${
		children.length + 1 - maxExpandedDialogs
	}`;

	// The height of each dialog. This is calculated so all dialogs stay within the
	// container height.
	const height = `calc(100% - (${headerHeight} * ${visibleLength - 1}))`;

	// TransitionGroup and CSSTransition should match usage in <Dialogs>.

	return (
		<div
			className="dialog-stack"
			onMouseLeave={() => setExpanded(false)}
			onClick={() => setExpanded(false)}
			ref={containerRef}
		>
			{stackHasOverflow && (
				<DialogStackExpander
					dialogLength={children.length}
					expanded={expanded}
					onChangeExpanded={setExpanded}
				/>
			)}
			<TransitionGroup component={null}>
				{childrenInRenderOrder.map((child, index) => {
					// This is the unexpanded top position of the dialog card. If the card
					// is not overflowed, then it's moved down to an even multiple of
					// headerHeight. If the card is overflowed, then it is moved down
					// based on overflowHeaderHeight instead, which evenly divides the
					// overflow area by the number of cards in it.

					// An example of a simple stack (length 3):
					// 0    index 0
					// 40px index 1
					// 80px index 2

					// An example of an overflowed stack (length 6):
					// 0    index 0
					// 10px index 1
					// 20px index 2
					// 30px index 3
					// -- overflow before this --
					// 40px index 4
					// 80px index 5

					const cardIsOverflowed =
						stackHasOverflow && index <= children.length - maxExpandedDialogs;
					const top = cardIsOverflowed
						? `calc(${overflowHeaderHeight} * ${index})`
						: `calc(${headerHeight} * ${
								stackHasOverflow
									? index - (children.length - maxExpandedDialogs)
									: index
						  })`;

					// When the stack is expanded, all cards get equal height.

					const expandedTop = `calc(${headerHeight} * ${index})`;

					// If an overflowed card gains focus, we need to expand it.

					const focusHandlers = cardIsOverflowed && {
						onBlur: () => setExpanded(false),
						onFocus: () => setExpanded(true)
					};

					// We need two container divs because CSSTransition will apply a
					// transform property to the outer container (via the pop-* classes),
					// but we also want to use transform to position the dialogs so that
					// we can smoothly animate their motion.
					//
					// We assign the `rising` CSS class to make it appear as if a dialog
					// that has moved to the front is popping into place. The check with
					// children's length is to ensure it doesn't get added if a dialog is
					// new to the stack.

					return (
						<CSSTransition
							classNames="pop"
							timeout={200}
							key={childKeysInRenderOrder[index]}
						>
							<div
								className={classnames('dialog-height-setter', {
									rising:
										foregroundIsRising &&
										index === childrenInRenderOrder.length - 1
								})}
								style={{height}}
								{...focusHandlers}
							>
								<div
									className="dialog-transform-setter"
									style={{
										transform: `translateY(${expanded ? expandedTop : top})`
									}}
								>
									{child}
								</div>
							</div>
						</CSSTransition>
					);
				})}
			</TransitionGroup>
		</div>
	);
};
