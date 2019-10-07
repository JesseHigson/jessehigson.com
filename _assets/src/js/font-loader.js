import FontFaceObserver from 'fontfaceobserver'

export default class FontLoader {
  /**
   * An object defining the fonts, weights and styles to be loaded
   *
   * @type {object}
   */
  fonts = {
    // The family name will set a class on the body of `font-family-name-loaded`
    // when the FontFaceObserver resolves
    'family-name': {
      // This should be the font name as used in css
      'Font Name 1': [
        // An array containing attributes for the font
        // => [weight, style, stretch]
        [400, 'normal', 'normal'],
      ],
      // Multiple fonts can be loaded for each family
      'Font Name 2': [
        // Arguments can be ommitted to use the default
        // => [400, 'normal', 'normal']
        [200],
      ]
    },
    // Use multiple families to separate font loading stages
    'another-family': {
      'Woolen': [
        [400]
      ]
    }
  }

  /**
   * Load all fonts on page load
   */
  constructor () {
    for (let family in this.fonts) {
      this.loadFamily(family)
    }
  }

  /**
   * Load a font family
   *
   * @param {string} family
   */
  loadFamily (family) {
    const key = `font-${family}-loaded`

    // If the key is already defined in session storage, we can immediately
    // use the version of the font in the browser's cache
    if (sessionStorage[key]) {
      document.documentElement.classList.add(key)
      return
    }

    // Create observers for each font in the family, and set the html class
    // and session storage key once all are loaded
    this.createObservers(family)
      .then(() => {
        sessionStorage[key] = true
        document.documentElement.classList.add(key)
      })
  }

  /**
   * Create a promise which resolves when all fonts in the family are loaded
   *
   * @param {string} family
   *
   * @return {Promise}
   */
  createObservers (family) {
    const observers = []

    // Loop through each font in the family
    for (let font in this.fonts[family]) {
      // Create an observer for each font style and add it to the observers list
      const styles = this.fonts[family][font]
      styles.forEach(([weight = 400, style = 'normal', stretch = 'normal']) => {
        observers.push(new FontFaceObserver(font, {
          weight:  weight,
          style:   style,
          stretch: stretch
        }))
      })
    }

    // Return a promise which resolves when all fonts in the family are loaded
    return Promise.all(observers.map(font => font.load()))
  }
}
