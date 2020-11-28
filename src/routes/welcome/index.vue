<template>
	<div class="welcome-route">
		<card-group :column-count="1" max-width="45em">
			<welcome-card
				v-for="(block, index) in visibleContent"
				:image="block.image"
				:key="block.title"
				@next="index === allContent.length - 1 ? onComplete() : onNext()"
				:next-label="$t(block.nextLabel || 'common.next')"
				:showSkip="index === 0"
				:title="block.title"
			>
				<div v-html="block.html" />
			</welcome-card>
		</card-group>
	</div>
</template>

<script>
import {mapActions} from 'vuex';
import scroll from 'scroll';
import Vue from 'vue';
import CardGroup from '@/components/container/card-group';
import content from './content';
import WelcomeCard from '@/components/welcome/welcome-card';
import './index.css';

export default {
	name: 'welcome-route',
	components: {CardGroup, WelcomeCard},
	computed: {
		allContent() {
			return content();
		},
		allVisible() {
			return this.shown >= this.allContent.length;
		},
		visibleContent() {
			return this.allContent.slice(0, this.shown);
		}
	},
	data: () => ({shown: 1}),
	methods: {
		onComplete() {
			this.updatePref({welcomeSeen: true});
			this.$router.push('/stories');
		},
		onNext() {
			this.shown++;
			Vue.nextTick(() => {
				scroll.top(
					document.documentElement || document.body,
					this.$el.querySelector('.welcome-block:last-of-type').offsetTop,
					{duration: 400}
				);
			});
		},
		...mapActions('pref', {updatePref: 'update'})
	}
};
</script>
