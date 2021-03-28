import * as React from 'react';
import classNames from 'classnames';
import './main-content.css';

interface MainContentProps extends React.ComponentPropsWithoutRef<'div'> {
	grabbable?: boolean;
	padded?: boolean;
	title?: string;
}

export const MainContent = React.forwardRef<HTMLDivElement, MainContentProps>(
	(props, ref) => {
		const {children, title} = props;
		const className = classNames('main-content', {
			padded: props.padded ?? true
		});

		return (
			<div className={className} ref={ref}>
				{title && <h1>{title}</h1>}
				{children}
			</div>
		);
	}
);
