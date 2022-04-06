import * as React from 'react';
import {TagStripeProps} from '../tag-stripe';

export const TagStripe: React.FC<TagStripeProps> = ({tags}) => (
	<div data-testid="mock-tag-stripe">{tags.join(' ')}</div>
);
