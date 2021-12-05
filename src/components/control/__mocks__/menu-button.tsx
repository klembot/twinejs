import * as React from 'react';
import {IconButton} from '../icon-button';
import {ButtonBarSeparator} from '../../container/button-bar/button-bar-separator';
import {MenuButtonProps} from '../menu-button';
import {IconEmpty} from '../../image/icon';
import {CheckboxButton} from '../checkbox-button';

export const MenuButton: React.FC<MenuButtonProps> = ({items, label}) => {
	return (
		<div data-testid={`mock-menu-button-${label}`}>
			{items.map((item, index) => {
				if (item.separator) {
					return <ButtonBarSeparator key={index} />;
				}

				return 'checkable' in item ? (
					<CheckboxButton
						disabled={item.disabled}
						key={index}
						label={item.label}
						onChange={item.onClick}
						uncheckedIcon={<IconEmpty />}
						value={item.checked}
					/>
				) : (
					<IconButton
						disabled={item.disabled}
						icon={<IconEmpty />}
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
