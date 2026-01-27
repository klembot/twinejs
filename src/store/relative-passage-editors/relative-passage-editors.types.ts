export interface RelativeEditor {
	passageId: string;
	storyId: string;
}

export interface RelativePassageEditorsState {
	editors: RelativeEditor[];
	activeEditorId: string | null;
}

export type RelativePassageEditorsAction =
	| {type: 'add'; passageId: string; storyId: string}
	| {type: 'remove'; passageId: string}
	| {type: 'setActive'; passageId: string | null}
	| {type: 'closeAll'};

export type RelativePassageEditorsDispatch = React.Dispatch<
	RelativePassageEditorsAction
>;

export interface RelativePassageEditorsContextProps {
	dispatch: RelativePassageEditorsDispatch;
	state: RelativePassageEditorsState;
}
