import {DialogCardProps} from '../components/container/dialog-card';

export type DialogComponentProps = Omit<DialogCardProps, 'headerLabel'>;

export interface Dialog {
	/**
	 * Is the dialog collapsed? (only showing its title bar)
	 */
	collapsed: boolean;
	/**
	 * Component to render.
	 */
	component: React.ComponentType<any>;
	/**
	 * Is the dialog highlighted? This is used to call attention to one when the
	 * user asks to re-open it.
	 */
	highlighted: boolean;
	/**
	 * Is the dialog maximized? Although only one dialog can be maximized at a
	 * time, this is an attribute so that when a dialog is un-minimized, it goes
	 * back to its previous position.
	 */
	maximized: boolean;
	/**
	 * Props to apply to the component.
	 */
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
	| {type: 'setDialogCollapsed'; collapsed: boolean; index: number}
	| {type: 'setDialogHighlighted'; highlighted: boolean; index: number}
	| {type: 'setDialogMaximized'; maximized: boolean; index: number};