<template>
	<div class="passage-search-result">
		<raised-paper>
			<div class="header">
				<p v-html="nameHighlighted" />
				<anchored-paper
					@click-away="toggleMenu"
					position="bottom"
					:visible="menuVisible"
				>
					<template v-slot:anchor>
						<icon-button @click="toggleMenu" icon="settings" />
					</template>
					<template v-slot:paper>
						<div class="stack tight vertical">
							<icon-button
								icon="zap"
								label="components.passageSearchResult.replace"
							/>
							<icon-button
								icon="edit"
								label="components.passageSearchResult.editPassage"
							/>
							<icon-button
								icon="map-pin"
								label="components.passageSearchResult.showPassage"
							/>
						</div>
					</template>
				</anchored-paper>
			</div>
			<p>
				<!-- <icon-button @click="toggleExpanded" icon="chevron-right">
					{{
						$tc('components.passageSearchResult.matchCount', textMatches, {
							matchCount: textMatches
						})
					}}
				</icon-button> -->
			</p>
			<div class="detail" v-if="expanded" v-html="textHighlighted" />
		</raised-paper>
	</div>
</template>

<script>
import AnchoredPaper from '../surface/anchored-paper';
import IconButton from '../input/icon-button';
import RaisedPaper from '../surface/raised-paper';
import './passage-search-result.less';

export default {
	components: {AnchoredPaper, IconButton, RaisedPaper},
	data() {
		return {expanded: true, menuVisible: false};
	},
	methods: {
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
