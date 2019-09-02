import Vue from 'vue';
import modalDialog from '../../ui/modal-dialog';
import {say} from '../../locale';
import template from './index.html';
import './index.less';

export default Vue.extend({
	props: ['origin'],
	template,
	computed: {
		gplText() {
			return say(
				`This application is released under the <a href="http://www.gnu.org/licenses/gpl-3.0.html">GPL v3</a> license, but any work created with it may be released under any terms, including commercial ones.`
			);
		},
		fontsText() {
			return say(
				`Source Sans Pro and Source Code Pro were designed by Paul D. Hunt under the guidance of Robert Slimbach for <a href="http://adobe.com/">Adobe</a><br> Nunito was designed by <a href="http://code.newtypography.co.uk/">Vernon Adams</a>`
			);
		}
	},
	components: {
		'modal-dialog': modalDialog
	},
	vuex: {
		getters: {
			appInfo: state => state.appInfo
		}
	}
});
