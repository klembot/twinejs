<template>
	<div class="story-list-toolbar">
		<fixed-toolbar :padding="true" position="right" type="depressed">
			<template v-slot:start>
				<img :src="appIcon" alt class="app-icon" />
				<h2>Twine</h2>
			</template>
			<template v-slot:middle>
				<icon-button label="Story" icon="plus" type="create" title="Create a brand new story"></icon-button>
				<icon-button
					label="Import From File"
					icon="upload"
					title="Import a published Twine story or archive"
				></icon-button>
				<icon-button label="Archive" icon="file-export" title="Save all stories to a Twine archive"></icon-button>
				<icon-button label="Formats" icon="file-code" title="Work with story and proofing formats"></icon-button>
				<icon-button label="Language" icon="globe" title="Change the language Twine uses"></icon-button>
				<icon-button label="Help" icon="question-circle" title="Browse online help"></icon-button>
			</template>
			<template v-slot:end>
				<p class="smaller">
					Version ?.?.?
					<br />
					<icon-button label="Report a Bug" icon="bug"></icon-button>
				</p>
			</template>
		</fixed-toolbar>
	</div>
</template>
<script>
import FixedToolbar from '../../components/layout/fixed-toolbar';
import IconButton from '../../components/form/icon-button';
import AppIcon from '../../../icons/app.svg';
import {library} from '@fortawesome/fontawesome-svg-core';
import {
	faBug,
	faFileCode,
	faFileExport,
	faGlobe,
	faPlus,
	faQuestionCircle,
	faUpload
} from '@fortawesome/free-solid-svg-icons';
import './toolbar.less';

library.add(
	faBug,
	faFileCode,
	faFileExport,
	faGlobe,
	faPlus,
	faQuestionCircle,
	faUpload
);

export default {
	components: {FixedToolbar, IconButton},
	computed: {
		appIcon() {
			return AppIcon;
		}
	},
	name: 'story-list-toolbar'
};
</script>