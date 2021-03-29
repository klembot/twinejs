import * as React from 'react';
import classNames from 'classnames';
import {icons as featherSvg} from 'feather-icons';
import {EmptyIcon} from './extra-icons/empty';
import {TagNubIcon} from './extra-icons/tag-nub';
import {TypeSizeIcon} from './extra-icons/type-size';
import './icon.css';

const extraIcons = {
	empty: <EmptyIcon />,
	'tag-nub': <TagNubIcon />,
	'type-size': <TypeSizeIcon />
};

export interface IconProps {
	icon: string;
	label?: string;
}

const FeatherIcon: React.FC<{icon: string}> = ({icon}) => (
	<span dangerouslySetInnerHTML={{__html: featherSvg[icon].toSvg()}} />
);

export const Icon: React.FC<IconProps> = ({icon, label}) => {
	const className = classNames('icon-image', {
		'loading-spinner': icon === 'loading-spinner'
	});

	let svg: React.ReactNode = null;

	if (icon === 'loading-spinner') {
		svg = <FeatherIcon icon="circle" />;
	} else svg = (extraIcons as any)[icon] ?? <FeatherIcon icon={icon} />;

	return (
		<span aria-hidden={!label} aria-label={label} className={className}>
			{svg}
		</span>
	);
};
