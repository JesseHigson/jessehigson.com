/**
 * Check if the slider is currently within the viewport
 *
 * @param {HTMLElement} element
 * @param {object}      offset
 *
 * @return {bool}
 */
export function isInViewport (element, offset = { x: 0, y: 0 }) {
  const { top, left, bottom, right } = element.getBoundingClientRect()

  return top <= (window.innerHeight + offset.y) &&
    bottom >= (0 - offset.y) &&
    left <= (window.innerWidth + offset.x) &&
    right >= (0 - offset.x)
}

/**
 * Easing function, equivalent to easeInOutCubic
 *
 * @see {https://gist.github.com/gre/1650294}
 *
 * @param {number} t
 *
 * @return {number}
 */
export function ease (t) {
  if (t < 0.5) {
    return 4 * t * t * t
  }

  return (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

/**
 * Animate a value
 *
 * @param {number}   from
 * @param {number}   to
 * @param {number}   duration
 * @param {function} callback
 *
 * @return {void}
 */
export function animate (from, to, duration = 500, callback, easing = ease) {
  const diff = to - from

  if (!diff) {
    return
  }

  let start, value

  /**
   * Set values for each step in the animation
   *
   *
   * @param {number} timestamp
   */
  const step = function (timestamp) {
    if (!start) {
      start = timestamp
    }

    var time = timestamp - start
    var percent = easing(Math.min(time / duration, 1))

    value = (from + diff * percent)

    if (time >= duration) {
      value = to
      callback(value)
      return
    }

    callback(value)
    requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

/**
 * Smoothly scroll to an element on the page
 *
 * @param {HTMLElement} element
 * @param {Number} duration
 *
 * @return {void}
 */
export function scrollToElement (element, duration = 500) {
  const from = window.pageYOffset
  const to = element.getBoundingClientRect().top + window.pageYOffset

  return animate(from, to, duration, y => {
    window.scrollTo(0, y)
  })
}

/**
 * Smoothly scroll to an element on the page
 *
 * @param {Number} position
 * @param {Number} duration
 *
 * @return {void}
 */
export function scrollToPosition (position = 0, duration = 500) {
  const from = window.pageYOffset
  const to = position

  return animate(from, to, duration, y => {
    window.scrollTo(0, y)
  })
}

export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
