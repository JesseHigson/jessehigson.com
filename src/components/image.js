import React, { Component } from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'
import atob from 'atob'
import ImageType from '../types/image'

const DEFAULT_STYLE = {
  display: 'block',
}

const Image = ({
  image,
  className = '',
  style = {},
  imgStyle = {},
  ...props
}) => {
  className = `image ${className}`
  style = { ...DEFAULT_STYLE, ...style }
  imgStyle = { ...DEFAULT_STYLE, ...imgStyle }

  /** @type {ImageType} image */
  // Everything rendered after this point is a DOM element,
  // so remove any props which would be invalid in that context
  delete props.fadeIn

  if (image.fluid && 'base64' in image.fluid) {
    const stub = 'data:image/svg+xml;base64,'
    if (image.fluid.base64.includes(stub)) {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: atob(image.fluid.base64.replace(stub, '')),
          }}
          {...props}
        />
      )
    }
  }

  if (image.gatsbyImageData) {
    return (
      <GatsbyImage
        className={className}
        image={image.gatsbyImageData}
        alt={image.alt}
        style={style}
        imgStyle={imgStyle}
        {...props}
      />
    )
  }

  if (image.fluid) {
    return (
      <figure className="image" style={style}>
        <img
          src={image.fluid.src}
          alt={image.alt}
          style={imgStyle}
          {...props}
        />
      </figure>
    )
  }

  return <div className="image-placeholder" {...props} />
}

export default Image
