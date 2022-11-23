import * as React from 'react';

export const PassageEditDialog = ({passageId}: {passageId: string}) => (
	<div data-testid={`mock-passage-edit-dialog`} data-passage-id={passageId} />
);
