export function fitBoundsWithWidget(annotationShape, widget, osd) {
  const containerBounds = osd.container.getBoundingClientRect()
  const rect = getAnnoRect(annotationShape, osd)
  osd.viewport.fitBoundsWithConstraints(rect)
}

export function getAnnoRect(annotationShape, osd){
  const {x, y, width, height } = annotationShape.getBBox()
  const padX = x
  const padY = y

  const padW = width 
  const padH = height

  return osd.viewport.imageToViewportRectangle(padX, padY, padW, padH)
}
