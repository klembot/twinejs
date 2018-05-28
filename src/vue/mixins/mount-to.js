// A mixin that offers a convenience method for mounting a component to a given
// element.

  /**
   * Append operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

function append(el, target, vm, cb) {
	target.appendChild(el);
	if (cb) {
		cb();
	}
}

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';

// UA sniffing for working around browser-specific quirks
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;

var transitionEndEvent = undefined;

// Transition property/event sniffing
if (inBrowser && !isIE9) {
	var isWebkitTrans = window.ontransitionend === undefined &&
	 window.onwebkittransitionend !== undefined;

	transitionEndEvent = isWebkitTrans ? 'webkitTransitionEnd' : 'transitionend';
}

/**
 * Apply transitions with an operation callback.
 *
 * @param {Element} el
 * @param {Number} direction
 *                  1: enter
 *                 -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function applyTransition(el, direction, op, vm, cb) {
	var transition = el.__v_trans;

	if (!transition ||
	// skip if there are no js hooks and CSS transition is
	// not supported
	!transition.hooks && !transitionEndEvent ||
	// skip transitions for initial compile
	!vm._isCompiled ||
	// if the vm is being manipulated by a parent directive
	// during the parent's compilation phase, skip the
	// animation.
	vm.$parent && !vm.$parent._isCompiled) {
	  op();
	  if (cb) {
		cb();
	  }
	  return;
	}
	var action = direction > 0 ? 'enter' : 'leave';

	transition[action](op, cb);
}

  /**
   * Check for selectors
   *
   * @param {String|Element} el
   */

function query(el) {
	return typeof el === 'string' ? document.querySelector(el) : el;
}

/**
 * Check if a node is in the document.
 * Note: document.documentElement.contains should work here
 * but always returns false for comment nodes in phantomjs,
 * making unit tests difficult. This is fixed by doing the
 * contains() check on the node's parentNode instead of
 * the node itself.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function inDoc(node) {
	if (!node) {
		return false;
	}
	var doc = node.ownerDocument.documentElement;
	var parent = node.parentNode;

	return doc === node ||
	 doc === parent ||
	  !!(parent && parent.nodeType === 1 && doc.contains(parent));
}

/**
 * Map a function to a range of nodes .
 *
 * @param {Node} node
 * @param {Node} end
 * @param {Function} op
 */

function mapNodeRange(node, end, op) {
	var next;

	while (node !== end) {
	  next = node.nextSibling;
	  op(node);
	  node = next;
	}
	op(end);
}

  /**
   * Shared DOM insertion function.
   *
   * @param {Vue} vm
   * @param {Element} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition]
   * @param {Function} op1 - op for non-transition insert
   * @param {Function} op2 - op for transition insert
   * @return vm
   */

function insert(vm, target, cb, withTransition, op1, op2) {
	target = query(target);
	var targetIsDetached = !inDoc(target);
	var op = withTransition === false || targetIsDetached ? op1 : op2;
	var shouldCallHook = !targetIsDetached && !vm._isAttached && !inDoc(vm.$el);

	if (vm._isFragment) {
		mapNodeRange(vm._fragmentStart, vm._fragmentEnd, function (node) {
 			op(node, target, vm);
		});
    	cb && cb();
	}
	else {
		op(vm.$el, target, vm, cb);
	}
	if (shouldCallHook) {
		console.log("vue 1 hook call?", vm._isMounted);
	}
	return vm;
}

/**
 * Append with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function appendWithTransition(el, target, vm, cb) {
	applyTransition(el, 1, function () {
	  target.appendChild(el);
	}, vm, cb);
}

const appendTo = function (vm, target, cb, withTransition) {
	return insert(vm, target, cb,
		 withTransition, append, appendWithTransition);
};


module.exports = {
	methods: {
		$mountTo(el) {
			const mountPoint = document.createElement('div');
			
			appendTo(this.$mount(mountPoint), el);
			return this;
		},
	}
};

