import {test, expect, Page} from '@playwright/test';

// The dev server picks another port if 5173 is taken, so allow overriding.

const baseUrl = process.env.TWINE_E2E_URL ?? 'http://localhost:5173';

async function skipWelcome(page: Page) {
	await page.goto(baseUrl);
	await page.getByRole('button', {name: 'Skip'}).click();
	await page.reload();
}

async function createStory(page: Page, name: string) {
	await skipWelcome(page);
	await page.getByRole('tab', {name: 'Story'}).click();
	await page.getByRole('button', {name: 'New'}).click();
	await page
		.getByRole('textbox', {
			name: 'What should your story be named? You can change this later.'
		})
		.fill(name);
	await page.getByRole('button', {name: 'Create'}).click();
	await expect(page).toHaveTitle(name);
}

/**
 * Puts focus on the story map itself, as clicking empty space in it would.
 */
async function focusStoryMap(page: Page) {
	await page.locator('[data-hotkey-scope="story-map"]').focus();
}

test('creates a passage with the N key in the story map', async ({page}) => {
	await createStory(page, 'Hotkey new passage');
	await focusStoryMap(page);
	await expect(
		page.getByRole('button', {name: 'Untitled Passage'})
	).toBeVisible();
	await page.keyboard.press('n');
	await expect(
		page.getByRole('button', {name: 'Untitled Passage 1'})
	).toBeVisible();
});

test('opens the rename prompt with F2', async ({page}) => {
	await createStory(page, 'Hotkey rename');
	await page.getByRole('button', {name: 'Untitled Passage'}).click();
	await page.keyboard.press('F2');
	await page
		.getByRole('textbox', {
			name: 'What should “Untitled Passage” be renamed to?'
		})
		.fill('Renamed by hotkey');
	await page.getByRole('button', {name: 'OK'}).click();
	await expect(
		page.getByRole('button', {name: 'Renamed by hotkey'})
	).toBeVisible();
});

test('undoes with Control-Z in the browser build', async ({page}) => {
	await createStory(page, 'Hotkey undo');
	await focusStoryMap(page);
	await page.keyboard.press('n');
	await expect(
		page.getByRole('button', {name: 'Untitled Passage 1'})
	).toBeVisible();
	await page.keyboard.press('Control+z');
	await expect(
		page.getByRole('button', {name: 'Untitled Passage 1'})
	).not.toBeVisible();
	await page.keyboard.press('Control+Shift+z');
	await expect(
		page.getByRole('button', {name: 'Untitled Passage 1'})
	).toBeVisible();
});

test('does not fire shortcuts while the user is typing', async ({page}) => {
	await createStory(page, 'Hotkey typing');
	await page.getByRole('button', {name: 'Untitled Passage'}).click();
	await page.getByRole('tab', {name: 'Passage'}).click();
	await page.getByRole('button', {name: 'Edit'}).click();
	await page.getByLabel('Passage Text').type('now not tonight');

	// No passages should have been created by the n's, and nothing deleted by
	// pressing Backspace inside the field.

	await page.keyboard.press('Backspace');
	await expect(page.getByText('now not tonigh')).toBeVisible();
	await expect(
		page.getByRole('button', {name: 'Untitled Passage 1'})
	).not.toBeVisible();
});

test('opens the shortcuts dialog from the Twine tab and lists commands', async ({
	page
}) => {
	await skipWelcome(page);
	await page.getByRole('tab', {name: 'Twine'}).click();
	await page.getByRole('button', {name: 'Keyboard Shortcuts'}).click();

	const dialog = page.getByRole('dialog', {name: 'Keyboard Shortcuts'});

	await expect(dialog).toBeVisible();

	// It opens maximized.

	await expect(page.locator('.dialogs > .maximized')).toBeVisible();

	// Rows show the command ID and its key.

	await expect(dialog.getByText('passage.create', {exact: true})).toBeVisible();
	await expect(
		dialog.locator('tr', {hasText: 'passage.create'}).getByText('N', {
			exact: true
		})
	).toBeVisible();

	// The platform strip explains what the modifier keys are.

	await expect(dialog.getByText('Showing keys for')).toBeVisible();
});

test('searches the shortcuts dialog by text and by pressing keys', async ({
	page
}) => {
	await skipWelcome(page);
	await page.getByRole('tab', {name: 'Twine'}).click();
	await page.getByRole('button', {name: 'Keyboard Shortcuts'}).click();

	const dialog = page.getByRole('dialog', {name: 'Keyboard Shortcuts'});

	await dialog.getByLabel('Search').fill('rename');
	await expect(dialog.getByText('passage.rename', {exact: true})).toBeVisible();
	await expect(
		dialog.getByText('passage.create', {exact: true})
	).not.toBeVisible();
	await dialog.getByLabel('Search').fill('');

	// Record mode: pressing a key shows every command using it, in any scope.

	await dialog.getByRole('button', {name: 'Record Keys'}).click();
	await dialog.getByLabel('Search').press('F2');
	await expect(dialog.getByText('passage.rename', {exact: true})).toBeVisible();
	await expect(dialog.getByText('story.rename', {exact: true})).toBeVisible();
	await expect(
		dialog.getByText('passage.create', {exact: true})
	).not.toBeVisible();

	// Escape clears what was recorded rather than closing the dialog.

	await dialog.getByLabel('Search').press('Escape');
	await expect(dialog).toBeVisible();
	await expect(dialog.getByText('passage.create', {exact: true})).toBeVisible();
});

test('changes a binding, and the new key works', async ({page}) => {
	await createStory(page, 'Hotkey rebind');
	await page.getByRole('tab', {name: 'Twine'}).click();
	await page.getByRole('button', {name: 'Keyboard Shortcuts'}).click();

	const dialog = page.getByRole('dialog', {name: 'Keyboard Shortcuts'});
	const row = dialog.locator('tr', {hasText: 'passage.create'});

	await row.getByRole('button', {name: 'Change Shortcut'}).click();
	await page.keyboard.press('j');
	await page.getByRole('button', {name: 'Save', exact: true}).click();
	await expect(row.getByText('J', {exact: true})).toBeVisible();
	await expect(row.getByText('Changed')).toBeVisible();

	// Close the dialog and try the new key.

	await dialog.getByRole('button', {name: 'Close'}).click();
	await focusStoryMap(page);
	await page.keyboard.press('n');
	await expect(
		page.getByRole('button', {name: 'Untitled Passage 1'})
	).not.toBeVisible();
	await page.keyboard.press('j');
	await expect(
		page.getByRole('button', {name: 'Untitled Passage 1'})
	).toBeVisible();

	// The change survives a reload, because it's stored in preferences.

	await page.reload();
	await focusStoryMap(page);
	await page.keyboard.press('j');
	await expect(
		page.getByRole('button', {name: 'Untitled Passage 2'})
	).toBeVisible();
});
