<template>
	<div class="welcome-route">
		<transition name="fade-in-out">
			<welcome-block
				title="Hi!"
				nextLabel="Tell Me More"
				:image="icons.TwineLogo"
				:showSkip="true"
				@next="onNext"
				@skip="onComplete"
			>
				<p>
					Twine is an open-source tool for telling interactive, nonlinear
					stories. There are a few things you should know before you get
					started.
				</p>
			</welcome-block>
		</transition>
		<transition name="fade-in-out">
			<welcome-block title="New here?" :image="icons.HelpImage" v-if="shown > 1" @next="onNext">
				<p>
					<strong>If you've never used Twine before, then welcome!</strong>
					The Twine 2 Guide and the official wiki in general, are a great
					place to learn. Keep in mind that some articles on the wiki were
					written for Twine 1, which is a little bit different than this
					version. But most of the concepts are the same.
				</p>
				<p>
					<strong>If you have used Twine 1 before,</strong> the guide also
					has details on what has changed in this version. Chief among
					them is a new default story format, Harlowe. But if you find you
					prefer the Twine 1 scripting syntax, try using SugarCube
					instead.
				</p>
			</welcome-block>
		</transition>
		<transition name="fade-in-out">
			<welcome-block
				title="Your work is saved only in your browser."
				:image="icons.SaveImage"
				v-if="shown > 2 && !isElectron"
				@next="onNext"
			>
				<p>
					That means you don't need to create an account to use Twine 2,
					and everything you create isn't stored on a server somewhere
					else&mdash;it stays right in your browser.
				</p>
				<p>
					Two
					<strong>very important</strong> things to remember, though.
					Since your work is saved only in your browser, if you clear its
					saved data, then you'll lose your work! Not good. Remember to
					use that
					<strong>Archive</strong> button often. You can also
					publish individual stories to files using the menu on each story
					in the story list. Both archive and story files can always be
					re-imported into Twine.
				</p>
				<p>
					Secondly,
					<strong>
						anyone who can use this browser can see and
						make changes to your work.
					</strong> So if you've got a nosy kid
					brother, look into setting up a separate profile for yourself.
				</p>
			</welcome-block>
		</transition>
		<transition name="fade-in-out">
			<welcome-block
				title="Your work is automatically saved."
				:image="icons.SaveImage"
				v-if="shown > 2 && isElectron"
				@next="onNext"
			>
				<p>
					There's now a folder named Twine in your Documents folder.
					Inside that is a Stories folder, where all your work will be
					saved. Twine saves as you work, so you don't have to worry about
					remembering to save it yourself. You can always open the folder
					your stories are saved to by using the
					<strong>Show Library</strong> item in the
					<strong>Twine</strong> menu.
				</p>
				<p>
					Because Twine is always saving your work, the files in your
					story library will be locked from editing while Twine is open.
				</p>
				<p>
					If you'd like to open a Twine story file you received from
					someone else, you can import it into your library using the
					<strong>Import From File</strong> link in the story list.
				</p>
			</welcome-block>
		</transition>
		<transition name="fade-in-out">
			<welcome-block
				title="That's it!"
				nextLabel="Go to the Story List"
				:image="icons.SmileImage"
				v-if="shown > 3"
				@next="onComplete"
			>
				<p>Thanks for reading, and have fun with Twine.</p>
			</welcome-block>
		</transition>
	</div>
</template>

<script>
import {mapActions} from 'vuex';
import scroll from 'scroll';
import Vue from 'vue';
import isElectron from '../../util/is-electron';
import WelcomeBlock from '../../components/welcome/welcome-block';
import HelpImage from './help.svg';
import SaveImage from './save.svg';
import SmileImage from './smile.svg';
import TwineLogo from '../../../icons/app.svg';
import './index.less';

export default {
	name: 'welcome-route',
	components: {WelcomeBlock},
	computed: {
		isElectron,
		icons() {
			return {HelpImage, SaveImage, SmileImage, TwineLogo};
		}
	},
	data: () => ({shown: 1}),
	methods: {
		onComplete() {
			this.updatePref({welcomeSeen: true});
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