import LiveNodeList from 'live-node-list'
import { bind } from 'decko'

export default class ImageCursors {
  /**
   * @type {LiveNodeList}
   */
  imageLinks = new LiveNodeList('.image-cursor')

  /**
   *
   */
  constructor() {
    this.registerListeners()
  }

  /**
   *
   */
  @bind
  registerListeners() {
    this.imageLinks.forEach(this.setupCursor)

    this.imageLinks.on('update', (newItems, oldItems) => {
      newItems.forEach(this.setupCursor)
    })
  }

  /**
   *
   */
  @bind
  setupCursor(imageCursor) {
    const cursor = imageCursor.querySelector('.image-cursor__image')
    
    if (cursor) {
      imageCursor.addEventListener('mousemove', e => {
        this.moveCursor(e, cursor)
      })

      imageCursor.addEventListener("mouseenter", e => { 
        this.onMouseEnter(e, cursor)
      })

      imageCursor.addEventListener("mouseleave", e => {
        this.onMouseExit(e, cursor)
      })
    }
  }

  /**
   *
   */
  @bind
  moveCursor(e, cursor) {
    const cursorParent = cursor.parentNode

    requestAnimationFrame(t => {
      const offsetx = cursorParent.getBoundingClientRect().left
      const offsety = cursorParent.getBoundingClientRect().top

      let xPosition = e.clientX - offsetx - (cursorParent.getBoundingClientRect().width / 2)
      let yPosition = e.clientY - offsety - (cursorParent.getBoundingClientRect().height / 2)

      cursor.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0)`
    })
  }
  
  /**
   *
   */
  @bind
  onMouseEnter(e, cursor) {
    requestAnimationFrame(t => {
      cursor.style.opacity = 1
    })
  }

  /**
   *
   */
  @bind
  onMouseExit(e, cursor) {
    requestAnimationFrame(t => {
      cursor.style.opacity = 0
    })
  }
}
