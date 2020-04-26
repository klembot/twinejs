import {configure} from '@storybook/vue';
import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);
new VueI18n({fallbackLocale: 'en-us'});
configure(require.context('../src', true, /\.stories\.js$/), module);
