/**
 * This file contains patches for built-in objects to either provide additional
 * functionality, or bring old browsers up to current spec. Where possible,
 * browser versions with native support are noted in the comments.
 *
 * The ESLint rule disallowing extension of native prototypes is disabled
 * for this file only to allow polyfilling.
 *
 * When browser support for a
 * function is such that we no longer need to polyfill, that function should
 * be able to be safely removed from this file without breaking functionality
 */

/* eslint no-extend-native: "off" */

/**
 * Comment out this line if you do not need to import Babel polyfills to enable
 * ES2017+ features such as async/await for older browsers
 */
import 'regenerator-runtime/runtime'


function polyfill() {
}

export default polyfill
