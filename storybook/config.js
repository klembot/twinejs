import {configure} from '@storybook/vue';

configure(require.context('../src', true, /\.stories\.js$/), module);
