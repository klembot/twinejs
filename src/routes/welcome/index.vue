<template>
	<div class="welcome-route">
		<transition
			name="fade-in-out"
			v-for="(block, index) in visibleContent"
			:key="block.title"
		>
			<welcome-block
				:nextLabel="$t(block.nextLabel || 'Next')"
				:icon="block.icon"
				:image="block.image"
				@next="index === allContent.length - 1 ? onComplete() : onNext()"
				@skip="onComplete"
				:showSkip="index === 0"
				:title="block.title"
			>
				<div v-html="block.html" />
			</welcome-block>
		</transition>
	</div>
</template>

<script>
import {mapActions} from 'vuex';
import scroll from 'scroll';
import Vue from 'vue';
import WelcomeBlock from '../../components/welcome/welcome-block';
import content from './content';
import './index.less';

export default {
	name: 'welcome-route',
	components: {WelcomeBlock},
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
