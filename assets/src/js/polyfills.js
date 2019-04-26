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
import '@babel/polyfill'

/**
 * Polyfill for the InsersectionObserver class, to support lazy loading
 */
import 'intersection-observer'

/**
 * Import polyfill for 'object-fit' in CSS
 */
import objectFitImages from 'object-fit-images'

/**
 * Polyfill for Array.fill
 *
 * Chrome: 45, Edge: 12, Firefox: 31, IE: N/A, Opera: 21, Safari: 7.1
 */
Array.prototype.fill = Array.prototype.fill || function (value) {
  if (this == null) {
    throw new TypeError('this is null or not defined')
  }

  var O = Object(this)
  var len = O.length >>> 0
  var start = arguments[1]
  var relativeStart = start >> 0
  var k = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len)
  var end = arguments[2]
  var relativeEnd = end === undefined ? len : end >> 0
  var final = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len)

  while (k < final) {
    O[k] = value
    k++
  }

  return O
}

/**
 * Monkeypatch for Ruby's Number.times
 *
 * Chrome: N/A, Edge: N/A, Firefox: N/A, IE: N/A, Opera: N/A, Safari: N/A
 *
 * @param {Function} f
 */
Number.prototype.times = Number.prototype.times || function (f) {
  return Array(this.valueOf()).fill().map((_, i) => f(i))
}

/**
 * Polyfill for Element.matches to provide IE support
 *
 * Chrome: 34, Edge: 12, Firefox: 34, IE: N/A, Opera: 21, Safari: 7.1
 *
 * @param {string} selector
 */
Element.prototype.matches = Element.prototype.matches || function (selector) {
  const fn =
    this.matchesSelector ||
    this.msMatchesSelector ||
    this.mozMatchesSelector ||
    this.webkitMatchesSelector ||
    this.oMatchesSelector

  return fn.call(this, selector)
}

/**
 * Polyfill for Element.closest to provide IE support
 *
 * Chrome: 41, Edge: 15, Firefox: 35, IE: N/A, Opera: 28, Safari: 9
 *
 * @param {string} selector
 * @param {string} stopSelector
 */
Element.prototype.closest = Element.prototype.closest || function (selector, stopSelector) {
  let el = this

  while (el) {
    if (el.matches(selector)) {
      return el
    }

    if (stopSelector && el.matches(stopSelector)) {
      return
    }

    el = el.parentElement
  }
}

/**
 * Polyfill NodeList.foreach in IE
 *
 * Chrome: 51, Edge: N/A, Firefox: 50, IE: N/A, Opera: 38, Safari: 10
 *
 * @param {Function} cb
 * @param {Function} thisArg
 */
NodeList.prototype.forEach = NodeList.prototype.forEach || function (cb, thisArg) {
  return Array.prototype.forEach.call(this, cb, thisArg)
}

Element.prototype.remove = function () {
  this.parentElement.removeChild(this)
}

NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
  for (var i = this.length - 1; i >= 0; i--) {
    if (this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i])
    }
  }
}

function polyfill () {
  /**
   * Run the object-fit-images polyfill
   */
  const images = Array.from(document.getElementsByTagName('img')).filter(image => !('src' in image.dataset))
  objectFitImages(images)
}

export default polyfill
