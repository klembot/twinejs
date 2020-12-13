<template>
	<div class="passage-map" :style="style">
		<passage-card
			v-for="passage in passages"
			@delete="onDeletePassage"
			@drag="onDragPassage"
			@drag-stop="onDragPassageStop"
			@edit="onEditPassage"
			:key="passage.id"
			:offsetX="passage.selected ? dragXChange / zoom : 0"
			:offsetY="passage.selected ? dragYChange / zoom : 0"
			:passage="passage"
			@select-exclusive="onSelectPassage(passage, true)"
			@select-inclusive="onSelectPassage(passage, false)"
			:show-excerpt="showPassageExcerpts"
			:tagColors="tagColors"
			@test="onTestPassage"
			:zoom="zoom"
		/>
		<link-container>
			<link-arrow
				v-for="linkArrow in linkArrows"
				:key="
					`${linkArrow[0].top}-${linkArrow[0].left}-${
						linkArrow[1] ? linkArrow[1].top : 'null'
					}-${linkArrow[1] ? linkArrow[1].left : 'null'}`
				"
				:start="linkArrow[0]"
				:end="linkArrow[1]"
			/>
		</link-container>
		<slot></slot>
	</div>
</template>

<script>
import LinkArrow from '@/components/story/link-arrow';
import LinkContainer from '@/components/story/link-container';
import PassageCard from '@/components/passage/passage-card';
import './index.css';

export default {
	components: {LinkArrow, LinkContainer, PassageCard},
	computed: {
		linkArrows() {
			/*
			Prepare an array that can be iterated over with <link-arrow>. When
			calculating positions, we don't need to worry about view zoom--we
			instead scale the entire container. We *do* need to factor zoom in
			when adjusting for drags, since those are in screen pixels.
			*/

			const logicalDragX = this.dragXChange / this.zoom;
			const logicalDragY = this.dragYChange / this.zoom;

			const apparentPosition = passage => ({
				height: passage.height,
				left: passage.selected ? passage.left + logicalDragX : passage.left,
				top: passage.selected ? passage.top + logicalDragY : passage.top,
				width: passage.width
			});

			const passageNamed = name => this.passages.find(p => p.name === name);

			return Object.keys(this.passageLinks).reduce(
				(result, startPassageName) => {
					const startPassage = passageNamed(startPassageName);

					/* Should never happen, but just in case. */

					if (!startPassage) {
						console.warn(
							`A passage named "${startPassageName}" doesn't exist, skipping`
						);
						return result;
					}

					const startPos = apparentPosition(startPassage);
					const connections = this.passageLinks[startPassageName].map(
						endPassageName => {
							const endPassage = passageNamed(endPassageName);

							if (endPassage) {
								return [startPos, apparentPosition(endPassage)];
							}

							return [startPos, null];
						}
					);

					return [...result, ...connections];
				},
				[]
			);
		},
		showPassageExcerpts() {
			return this.zoom > 0.5;
		},
		style() {
			return {
				transform: `scale(${this.zoom})`,
				transformOrigin: 'top left'
			};
		}
	},
	data: () => ({
		dragXChange: 0,
		dragYChange: 0
	}),
	methods: {
		onDeletePassage(passage) {
			this.$emit('delete', passage);
		},
		onDragPassage(xChange, yChange) {
			this.dragXChange = xChange;
			this.dragYChange = yChange;
		},
		onDragPassageStop(xChange, yChange) {
			if (xChange !== 0 || yChange !== 0) {
				this.$emit('move-selected', xChange, yChange);
			}

			this.dragXChange = 0;
			this.dragYChange = 0;
		},
		onEditPassage(passage) {
			this.$emit('edit', passage);
		},
		onSelectPassage(passage, exclusive) {
			this.$emit(`select-${exclusive ? 'exclusive' : 'inclusive'}`, passage);
		},
		onTestPassage(passage) {
			this.$emit('test', passage);
		}
	},
	props: {
		/* An object of 'passage name' => ['passage 1', 'passage 2'] entries. */
		passageLinks: {required: true, type: Object},
		/* Passage objects, straight as children of the story object. */
		passages: {required: true, type: Array},
		tagColors: {required: true, type: Object},
		zoom: {required: true, type: Number}
	}
};
</script>
