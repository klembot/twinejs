<template>
	<router-view></router-view>
</template>

<script>
import Router from './routes/router';
import store from './store';

export default {router: Router, store};
</script>