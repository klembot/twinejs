import {DialogCardProps} from '../components/container/dialog-card';

export type DialogComponentProps = Omit<DialogCardProps, 'headerLabel'>;

export interface Dialog {
	collapsed: boolean;
	component: React.ComponentType<any>;
	props?: Record<string, any>;
}

export type DialogsState = Dialog[];

export type DialogsAction =
	| {
			type: 'addDialog';
			component: React.ComponentType<any>;
			props?: Record<string, any>;
	  }
	| {type: 'removeDialog'; index: number}
	| {type: 'setDialogCollapsed'; collapsed: boolean; index: number};
