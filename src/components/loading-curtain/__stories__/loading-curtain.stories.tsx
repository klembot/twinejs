import * as React from 'react';
import {Story} from '@storybook/react';
import {LoadingCurtain} from '../loading-curtain';

const main = {component: LoadingCurtain, title: '<LoadingCurtain>'};
export default main;

const Template: Story = props => <LoadingCurtain {...props} />;

export const Base = Template.bind({});
