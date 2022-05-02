import classNames from 'classnames';
import * as React from 'react';
import {Point} from '../../util/geometry';
import {DocumentTitle} from '../document-title/document-title';
import './main-content.css';

export interface MainContentProps
	extends React.ComponentPropsWithoutRef<'div'> {
	grabbable?: boolean;
	padded?: boolean;
	title?: string;
}

export const MainContent = React.forwardRef<HTMLDivElement, MainContentProps>(
	(props, ref) => {
		const {children, grabbable, title} = props;
		const containerRef = React.useRef<HTMLDivElement>(null);
		const className = classNames('main-content', {
			padded: props.padded ?? true
		});

		React.useImperativeHandle(
			ref,
			() => containerRef.current as HTMLDivElement
		);

		React.useEffect(() => {
			if (containerRef.current) {
				containerRef.current.focus();
			}
		}, []);

		React.useEffect(() => {
			const container = containerRef.current;
			let dragScrollStart: Point;
			let dragMouseStart: Point;

			function moveListener(event: PointerEvent) {
				if (container) {
					container.scrollLeft =
						dragScrollStart.left + (dragMouseStart.left - event.clientX);
					container.scrollTop =
						dragScrollStart.top + (dragMouseStart.top - event.clientY);
				}
			}

			function upListener(event: PointerEvent) {
				if (event.button !== 2 || !container) {
					return;
				}

				container.releasePointerCapture(event.pointerId);
				container.removeEventListener('pointermove', moveListener);
				container.style.cursor = '';
				event.preventDefault();
			}

			function downListener(event: PointerEvent) {
				if (event.button !== 2 || !container) {
					return;
				}

				container.setPointerCapture(event.pointerId);
				container.addEventListener('pointermove', moveListener);
				container.addEventListener('pointerup', upListener);
				container.style.cursor = 'grabbing';
				dragScrollStart = {
					left: container.scrollLeft,
					top: container.scrollTop
				};
				dragMouseStart = {left: event.clientX, top: event.clientY};
				event.preventDefault();
			}

			function ignoreContext(event: Event) {
				event.preventDefault();
			}

			if (grabbable && container) {
				container.addEventListener('pointerdown', downListener);
				container.addEventListener('contextmenu', ignoreContext);
				return () => {
					container.removeEventListener('pointerdown', downListener);
					container.removeEventListener('contextmenu', ignoreContext);
				};
			}
		}, [grabbable]);

		return (
			<div className={className} ref={containerRef}>
				{title && (
					<>
						<DocumentTitle title={title} />
						<h1>{title}</h1>
					</>
				)}
				{children}
			</div>
		);
	}
);
