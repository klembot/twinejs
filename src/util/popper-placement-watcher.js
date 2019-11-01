export default class {
	constructor(callback) {
		if (!callback) {
			throw new Error('Placement modifier used without callback option');
		}

		this.enabled = true;
		this.name = 'placementWatcher';
		this.options = {callback};
		this.phase = 'write';
	}

	fn({options, state}) {
		options.callback(state.placement);
	}
}
