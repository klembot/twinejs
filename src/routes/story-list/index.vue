<template>
	<div class="story-list">
		<h1>Stories</h1>
		<p>This is the story list.</p>
		<story-list-toolbar></story-list-toolbar>
	</div>
</template>
<script>
import StoryListToolbar from './toolbar';

export default {
	components: {StoryListToolbar}
};
</script>