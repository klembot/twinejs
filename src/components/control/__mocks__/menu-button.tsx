import * as React from 'react';
import {IconButton} from '../icon-button';
import {ButtonBarSeparator} from '../../container/button-bar/button-bar-separator';
import {MenuButtonProps} from '../menu-button';
import {IconCheck} from '@tabler/icons';
import {IconEmpty} from '../../image/icon';

export const MenuButton: React.FC<MenuButtonProps> = ({items, label}) => {
	return (
		<div data-testid={`mock-menu-button-${label}`}>
			{items.map((item, index) => {
				if (item.separator) {
					return <ButtonBarSeparator key={index} />;
				}

				return (
					<IconButton
						disabled={item.disabled}
						icon={item.checked ? <IconCheck /> : <IconEmpty />}
						key={index}
						label={item.label}
						onClick={item.onClick}
						variant={item.variant}
					/>
				);
			})}
		</div>
	);
};
