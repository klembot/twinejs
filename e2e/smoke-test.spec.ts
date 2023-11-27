import {test, expect, Page} from '@playwright/test';

async function skipWelcome(page: Page) {
	await page.goto('http://localhost:5173');
	await page.getByRole('button', {name: 'Skip'}).click();
	await page.reload();
}

async function createStory(page: Page, name = 'E2E Test Story') {
	await skipWelcome(page);
	await page.getByRole('tab', {name: 'Story'}).click();
	await page.getByRole('button', {name: 'New'}).click();
	await page
		.getByRole('textbox', {
			name: 'What should your story be named? You can change this later.'
		})
		.type(name);
	await page.getByRole('button', {name: 'Create'}).click();
}

async function openPassageEditor(page: Page, name: string) {
	await page.getByRole('button', {name}).click();
	await expect(page.getByRole('button', {name})).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await page.getByRole('tab', {name: 'Passage'}).click();
	await page.getByRole('button', {name: 'Edit'}).click();
}

async function waitForPassageChange() {
	// Although the DOM updates when a passage is edited, actually saving changes
	// is debounced. This waits long enough for a change to complete.
	await new Promise(resolve => setTimeout(resolve, 1100));
}

test('Shows welcome screen on first run', async ({page}) => {
	await page.goto('http://localhost:5173');
	await expect(page).toHaveTitle('Hi!');
});

test("Doesn't show welcome screen after user finishes it", async ({page}) => {
	await skipWelcome(page);
	await expect(page).toHaveTitle('0 Stories');
	await page.goto('http://localhost:5173');
	await expect(page).toHaveTitle('0 Stories');
	await page.reload();
	await expect(page).toHaveTitle('0 Stories');
});

test('Can create a story', async ({page}) => {
	await createStory(page, 'Create story test');
	await expect(page).toHaveTitle('Create story test');

	// If these tabs are visible, we're in the story editor.

	await expect(page.getByRole('tab', {name: 'Passage'})).toBeVisible();
	await expect(page.getByRole('tab', {name: 'Story'})).toBeVisible();

	// Go back to the story list and make sure the story is present there.

	await page.goto('http://localhost:5173');
	await expect(page).toHaveTitle('1 Story');
	await expect(page.getByText('Create story test')).toBeVisible();
	await page.reload();
	await expect(page).toHaveTitle('1 Story');
	await expect(page.getByText('Create story test')).toBeVisible();
});

test('Persists passage edits', async ({page}) => {
	await createStory(page, 'Edit passage test');
	await openPassageEditor(page, 'Untitled Passage');

	// Test different typing speeds to try to shake out any problems with the
	// debounced update.

	await page.getByLabel('Passage Text').type('abcdef', {delay: 0});
	await page.getByLabel('Passage Text').type('ghijkl', {delay: 100});
	await page.getByLabel('Passage Text').type('mnopqr', {delay: 250});
	await page.getByLabel('Passage Text').type('stuvwx', {delay: 500});
	await expect(page.getByText('abcdefghijklmnopqrstuvwx')).toBeVisible();
	await waitForPassageChange();
	await page.reload();
	await expect(page.getByText('abcdefghijklmnopqrstuvwx')).toBeVisible();
});

test('Persists passage renames', async ({page}) => {
	await createStory(page, 'Edit passage test');
	await page.getByRole('button', {name: 'Untitled Passage'}).click();
	await page.getByRole('button', {name: 'Rename'}).click();
	await page
		.getByRole('textbox', {
			name: 'What should “Untitled Passage” be renamed to?'
		})
		.type('Rename test');
	await page.getByRole('button', {name: 'OK'}).click();
	await expect(page.getByRole('button', {name: 'Rename test'})).toBeVisible();
	await page.reload();
	await expect(page.getByRole('button', {name: 'Rename test'})).toBeVisible();
});

test('Creates a simple story and plays it', async ({context, page}) => {
	await createStory(page, 'Publish test');
	await openPassageEditor(page, 'Untitled Passage');
	await page
		.getByLabel('Passage Text')
		.type('Which way to go? [[Left]] or [[right]]?');
	await page.getByRole('button', {name: 'Close'}).click();
	await openPassageEditor(page, 'Left');
	await page.getByLabel('Passage Text').type('Monsters!');
	await waitForPassageChange();
	await page.getByRole('button', {name: 'Close'}).click();

	// Wait for the editor to close.

	await expect(page.getByLabel('Passage Text')).not.toBeVisible();
	await openPassageEditor(page, 'right');
	await page.getByLabel('Passage Text').type('Puppies!');
	await waitForPassageChange();
	await page.getByRole('button', {name: 'Close'}).click();
	await page.getByRole('tab', {name: 'Build'}).click();

	const [publishedPage] = await Promise.all([
		context.waitForEvent('page'),
		page.getByRole('button', {name: 'Play'}).click()
	]);

	// Trying to be as agnostic as possible about Harlowe's DOM structure. Visible
	// locators are to distinguish from passage data that's in the DOM but not
	// visible.

	await publishedPage.waitForSelector(':visible:text-is("Which way to go?")');
	await publishedPage.locator(':visible:text-is("Left")').click();
	await publishedPage.waitForSelector(':visible:text-is("Monsters!")');
	await expect(
		publishedPage.locator(':visible:text-is("Monsters!")')
	).toBeVisible();

	// Need to close the tab to reset play state. Reloading won't work.

	await publishedPage.close();

	const [republishedPage] = await Promise.all([
		context.waitForEvent('page'),
		page.getByRole('button', {name: 'Play'}).click()
	]);

	await republishedPage.locator(':visible:text-is("right")').click();
	await expect(
		republishedPage.locator(':visible:text-is("Puppies!")')
	).toBeVisible();
});
