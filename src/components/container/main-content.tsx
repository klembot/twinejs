import classNames from 'classnames';
import * as React from 'react';
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
		const {children, title} = props;
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
