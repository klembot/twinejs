# Developer documentation for TwineJS

This documentation is intended to give an overview of the TwineJS code to new developers, who would like to start contributing.

## Relationship among Twine components

This project (`twinejs`) provides:

- basic data types, chiefly `stories` made up of `passages`
- a user interface for editing, importing, and exporting stories

However, it does NOT dictate any real constraints on the content of passages.
The content of passages is interpretted by `story formats` such as
**Harlowe**, **SugarCube**, and **Snowman**.
Those story formats provide the "runtime" for stories,
and translate passage content into HTML, CSS, and JavaScript that a reader can interact with.

## Basic tooling

TwineJS is authored in JavaScript, using [the Vue framework](https://vuejs.org/).
Note that Twine uses Vue 1.x, although a 2.x series now exists.
Vue is well-regarded for its simplicity and [excellent documentation for beginners](https://v1.vuejs.org/guide/).
Be sure to use the older 1.0 documentation rather than the current 2.x docs.

To enable development, you will need to clone the TwineJS Git repository,
and [install Node](https://nodejs.org/).
Instructions for getting started are contained in [the main README](../README.md),
but the key commands are `npm install` followed by `npm start`.
These commands and many others are defined in `package.json`.

Files that end in `.spec.js` are unit tests, not part of the application logic proper.
They can be useful for demonstrating how components are used, however.

## Entry point

The entry point appears to be `src/index.ejs`.
Despite the extension, it appears to be an HTML file that includes all the external dependencies.
It also creates the `#main` div which holds all the other app components.

Twine itself appears to start in `src/index.js`.
This initializes localization, and loads some key modules:

- `store` (`src/data/store/`), which is a global singleton for shared state across Vue components.
- `TwineRouter` (`src/common/router.js`), which maps URLs to the components displayed on each "page" of the application.

## Shared state

Many of these are exposed through the `store`, which is effectively a global variable:

- `prefs` (`src/data/store/prefs.js`), for keeping global user preferences like default UI theme and default story format.
- `story` (`src/data/store/story.js`), which holds all the user's stories, and provides methods to create/read/update/delete stories and passages.
- `storyFormat` (`src/data/store/story-format.js`), which holds all of the available story formats.
- `src/data/local-storage/`, which has code for saving stories and passages to the browser's `localStorage` object.

## Core data structures

These are easiest to understand by using your browser's developer tools to inspect `localStorage` for your Twine stories.
All (?) Twine objects have a UUID to conveniently identify them.
Since UUIDs are randomly generated, the actual UUIDs in your browser will differ from those shown here.

### Stories

`twine-stories` contains a comma-separated list of UUIDs of stories.

`twine-stories-UUID` is an object like this:

```
id: "2236bf97-2ce3-446e-b59d-57d82e8ee714"
ifid: "FF075B98-1476-4C21-816A-A4D3D166764E"
lastUpdate: "2018-06-02T18:55:44.574Z"
name: "Troll Battle"
script: ""
snapToGrid: false
startPassage: "da03b0f9-2c2e-401d-be7f-e089dd099469"
storyFormat: "Harlowe"
storyFormatVersion: "2.1.0"
stylesheet: ""
tagColors: {}
zoom: 1
```

### Passages

`twine-passages` contains a comma-separated list of UUIDs of passages.

`twine-passages-UUID` is an object like this:

```
height: 100
id: "da03b0f9-2c2e-401d-be7f-e089dd099469"
left: 488.5
name: "Home"
selected: true
story: "2236bf97-2ce3-446e-b59d-57d82e8ee714"
tags: []
text: "The morning dawned clear and cold..."
top: 251.5
width: 100
```

### Story Formats

`twine-story-formats` contains a comma-separated list of UUIDs of story formats.

`twine-story-formats-UUID` is an object like this:

```
id: "396819a8-75fc-40e4-99a3-ad6bf98d0b03"
loaded: false
name: "Harlowe"
url: "story-formats/harlowe-2.1.0/format.js"
userAdded: false
version: "2.1.0"
```

### Prefs

`twine-prefs` contains a comma-separated list of UUIDs of preference objects.

`twine-prefs-UUID` is an object like this:

```
id: "28d7fe60-52d2-4d69-8fe5-48180d43f7a8"
name: "appTheme"
value: "light"
```

## Parts of the UI

You can generally trace from `src/common/router.js` to find the different pages of the app:

- `src/story-list-view/`: the main page, showing all the available stories, allowing story import/export, and setting global prefs.
- `src/story-edit-view/`:  the overview of a single story, showing passages as boxes connected by arrows.
- `src/welcome/`: the introductory tutorial shown to new users on their first visit.
- `src/locale/`:  allows the user to set their language (English, French, Spanish, etc).

Some components used by these pages are in their own directories:

- `src/editors/` contains the main text-editing dialogs for passages, extra JavaScript, and extra CSS.
- `src/dialogs/` contains other pop-up dialogs, like the About box and story import.
- `src/ui/` contains things like menus, buttons, and modal dialogs, which are base classes for other UI elements.
