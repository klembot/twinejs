import * as React from 'react';

interface CSSTransitionProps {
	in?: boolean;
}

export const CSSTransition: React.FC<CSSTransitionProps> = props => (
	<>{props.in && props.children}</>
);

// Force children in.

export const TransitionGroup: React.FC = ({children}) => (
	<>
		{React.Children.map(children, child => {
			const childNode = child as React.ReactElement;

			return React.cloneElement(childNode, {in: true});
		})}
	</>
);

