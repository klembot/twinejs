<template>
	<div class="passage-search-card">
		<base-card>
			<template v-slot:header>
				<span v-html="nameHighlighted" />
			</template>
			<div class="detail" v-if="expanded" v-html="textHighlighted" />
			<template v-slot:actions>
				<dropdown-button icon="more-horizontal" label="common.more">
					<icon-button
						@click="editPassage"
						icon="edit"
						label="components.passageSearchResult.editPassage"
					/>
					<icon-button
						@click="showPassage"
						icon="map-pin"
						label="components.passageSearchResult.showPassage"
					/>
				</dropdown-button>
				<icon-button
					@click="replaceInPassage"
					icon="zap"
					label="components.passageSearchResult.replace"
					type="danger"
				/>
			</template>
		</base-card>
	</div>
</template>

<script>
import BaseCard from '../container/base-card';
import DropdownButton from '../control/dropdown-button';
import IconButton from '../control/icon-button';
import './passage-search-card.css';

export default {
	components: {BaseCard, DropdownButton, IconButton},
	data() {
		return {expanded: true, menuVisible: false};
	},
	methods: {
		editPassage() {
			this.$emit('edit-passage', this.passage);
		},
		replaceInPassage() {
			this.$emit('replace-in-passage', this.passage);
		},
		showPassage() {
			this.$emit('show-passage', this.passage);
		},
		toggleExpanded() {
			this.expanded = !this.expanded;
		},
		toggleMenu() {
			this.menuVisible = !this.menuVisible;
		}
	},
	name: 'passage-search-result',
	props: {
		nameHighlighted: {required: true, type: String},
		passage: {required: true, type: Object},
		textHighlighted: {required: true, type: String},
		textMatches: {required: true, type: Number}
	}
};
</script>
