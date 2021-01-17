import Vue from 'vue';
import App from './app';
import 'focus-visible';
import './styles/focus-visible-shim.css';

new Vue(App).$mount('#main div');
