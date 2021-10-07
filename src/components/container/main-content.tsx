import * as React from 'react';
import classNames from 'classnames';
import {Helmet} from 'react-helmet';
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
		const className = classNames('main-content', {
			padded: props.padded ?? true
		});

		return (
			<div className={className} ref={ref}>
				{title && (
					<>
						<Helmet>
							<title>{title}</title>
						</Helmet>
						<h1>{title}</h1>
					</>
				)}
				{children}
			</div>
		);
	}
);
