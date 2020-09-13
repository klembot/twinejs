/**
 * Binds Vuex getters to a store for use by actions.
 */

export function bindVuexGetters(getters, store) {
	const result = {};

	Object.keys(getters).forEach(getterName => {
		result[getterName] = getters[getterName](store, result);
	});

	return result;
}

/**
 * A test harness for Vuex actions.
 */

export function actionCommits(action, payload, getters) {
	const commit = jest.fn();

	action({commit, getters}, payload);

	return commit.mock.calls;
}

/**
 * An async-specific version so all tests don't have to be async.
 */

export async function asyncActionCommits(action, payload, getters) {
	const commit = jest.fn();

	await action({commit, getters}, payload);

	return commit.mock.calls;
}
