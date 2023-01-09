import * as React from 'react';
import './dialog-stack-expander.css';

export interface DialogStackExpanderProps {
	dialogLength: number;
	expanded: boolean;
	onChangeExpanded: (value: boolean) => void;
}

export const DialogStackExpander: React.FC<
	DialogStackExpanderProps
> = props => {
	const {dialogLength, expanded, onChangeExpanded} = props;
	const [wasTouched, setWasTouched] = React.useState(false);

	// This listener is global and listens for touches anywhere when the stack is
	// expanded. Because it listens only on `touchstart`, it will never respond to
	// mouse-initiated events.

	React.useEffect(() => {
		function listener() {
			if (expanded) {
				onChangeExpanded(false);
				setWasTouched(false);
			}
		}

		window.addEventListener('touchstart', listener);
		return () => window.removeEventListener('touchstart', listener);
	}, [expanded, onChangeExpanded]);

	// If the stack is expanded and was opened via touch, we don't need to render
	// anything. The global listener will handle collapsing the stack.

	if (expanded && wasTouched) {
		return null;
	}

	// The stack is either not expanded, or a mouse was used to open the stack. In
	// this case, we render a div to catch events:
	// - mouseover to catch either expand or collapsing based on hover behavior.
	//   The style property sets the area we listen to for these events (the
	//   overflow area when the stack is collapsed, everything but the overflow
	//   area when it's expanded).
	// - touchend to handle expanding a collapsed stack via touch. We prevent
	//   default on this event to prevent mouse emulation events from firing.

	return (
		<div
			aria-hidden
			className="dialog-stack-expander"
			onMouseEnter={() => onChangeExpanded(!expanded)}
			onTouchEnd={event => {
				onChangeExpanded(true);
				setWasTouched(true);
				event.preventDefault();
			}}
			style={{
				bottom: expanded ? 0 : 'auto',
				height: expanded ? 'auto' : 'var(--control-height)',
				top: expanded ? `calc(var(--control-height) * ${dialogLength})` : 0
			}}
		/>
	);
};
