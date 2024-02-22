export function fitBoundsWithWidget(annotationShape, widget, viewer) {
  const containerBounds = viewer.container.getBoundingClientRect()

  const {x, y, width, height } = annotationShape.getBBox()
  const padX = x
  const padY = y

  const padW = width 
  const padH = height

  const rect = viewer.viewport.imageToViewportRectangle(padX, padY, padW, padH)
  viewer.viewport.fitBoundsWithConstraints(rect)
}
