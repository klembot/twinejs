<template>
	<div class="local-storage-quota">
		<meter-bar :percent="percent" />
		<div class="stack center">
			{{ $t('components.localStorageQuota.percentAvailable', {percent}) }}
			<icon-button
				@click="startMeasuring()"
				icon="refresh-cw"
				:title="$t('components.localStorageQuota.measureAgain')"
				type="flat"
			></icon-button>
		</div>
	</div>
</template>

<script>
import IconButton from '../control/icon-button';
import MeterBar from '../meter-bar';

const CHUNK_SIZE = 102400;

export default {
	components: {IconButton, MeterBar},
	computed: {
		percent() {
			return Math.round((this.free / (this.used + this.free)) * 100);
		}
	},
	created() {
		this.startMeasuring();
	},
	data: () => ({
		measuring: false,
		used: 0,
		free: 0
	}),
	methods: {
		startMeasuring() {
			if (this.measuring) {
				return;
			}

			this.measuring = true;

			/*
			We know how much space we're already using. We find out how much is
			free by trying to allocate more in 100k chunks, and failing once
			we've hit the quota.
			*/

			this.used = JSON.stringify(window.localStorage).length;
			this.free = CHUNK_SIZE;

			let storageIndex = 0;

			/* This is used to test how much local storage is left in 100k chunks. */

			let testString = 'x'.repeat(CHUNK_SIZE);
			const interval = window.setInterval(() => {
				let stop = false;

				try {
					window.localStorage.setItem('__quotatest' + storageIndex, testString);
					this.free += CHUNK_SIZE;
					storageIndex++;

					/*
					If we're already above 99%, then we don't need another
					iteration.
					*/

					if (this.percent <= 1) {
						stop = true;
					}
				} catch (e) {
					stop = true;
				}

				if (stop) {
					/*
					Clean up the items we put into the local storage to test.
					*/

					for (let i = 0; i <= storageIndex; i++) {
						window.localStorage.removeItem('__quotatest' + i);
					}

					testString = null;
					window.clearInterval(interval);
					this.measuring = false;
				}
			}, 20);
		}
	},
	name: 'local-storage-quota'
};
</script>
