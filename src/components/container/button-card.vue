<template>
	<div class="button-card">
		<base-card><slot></slot></base-card>
	</div>
</template>

<script>
import BaseCard from './base-card';
import './button-card.css';

export default {
	components: {BaseCard},
	name: 'button-card'
};
</script>
