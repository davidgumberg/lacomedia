import {computePosition} from '@floating-ui/dom'
import { getAnnoRect } from './annoviewer-plugin'
import OpenSeadragon from 'openseadragon'

export function CitationEditWidget(args) {
  this.viewer = args.viewer
  this.args = args
  this.annotation = new CiteAnnotation(args.annotation.underlying)

  this.updateCite = function(_event, inputs) {
    if (this.annotation.citeBody) {
      this.args.onUpdateBody(this.annotation.citeBody, {
        type: 'TextualBody',
        purpose: 'describing',
        value: inputs 
      });
    }
    else { 
      this.args.onAppendBody({
        type: 'TextualBody',
        purpose: 'describing',
        value: inputs 
      });
    }
  }

  this.updateVerse = function(event) {
    const sel = window.getSelection();
    const range = sel?.rangeCount > 0 ? sel?.getRangeAt(0) : null

    if (this.annotation.verseBody) {
      this.args.onUpdateBody(this.annotation.verseBody, {
        type: 'TextualBody',
        purpose: 'linking',
        value: event.target.innerHTML
      });
    }
    else { 
      this.args.onAppendBody({
        type: 'TextualBody',
        purpose: 'linking',
        value: event.target.innerHTML
      });
    }

    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }

  /* citeWidget is responsible for the html form that is used to edit the w3c
   * annotation that we serve */
  this.citeWidget = function() {
    const citeWidget = document.createElement('div')
    citeWidget.classList.add("cite-widget-container")

    const bookSelect = document.createElement('select')
    bookSelect.name = "book"
    const bookSelectLabel = document.createElement("label")
    bookSelectLabel.for = "book"
    bookSelectLabel.textContent = "Book"

    bookSelect.add(new Option('Inferno', 'inferno'))
    bookSelect.add(new Option('Purgatorio', 'purgatorio'))
    bookSelect.add(new Option('Paradiso', 'paradiso'))

    bookSelect.value = this.annotation.citeValue()?.book || "inferno"

    const bookSelectContainer = document.createElement('div')
    bookSelectContainer.classList.add("cite-widget-input-container")
    bookSelectContainer.appendChild(bookSelectLabel)
    bookSelectContainer.appendChild(bookSelect)
    citeWidget.appendChild(bookSelectContainer)

    const cantoInputLabel = document.createElement('label')
    cantoInputLabel.for = "canto"
    cantoInputLabel.textContent = "Canto"
    const cantoInput= document.createElement('input')
    cantoInput.name = "canto"
    cantoInput.required = true
    cantoInput.type = "text"
    cantoInput.size = "10"
    cantoInput.value = this.annotation.citeValue()?.canto || ""

    const cantoInputContainer = document.createElement('div')
    cantoInputContainer.classList.add("cite-widget-input-container")
    cantoInputContainer.appendChild(cantoInputLabel)
    cantoInputContainer.appendChild(cantoInput)

    citeWidget.appendChild(cantoInputContainer)

    const firstLineInputLabel = document.createElement('label')
    firstLineInputLabel.for = "first-line"
    firstLineInputLabel.textContent = "First Line"

    const firstLineInput = document.createElement('input')
    firstLineInput.required = true
    firstLineInput.type = "number"
    firstLineInput.size = "4"
    firstLineInput.value = this.annotation.citeValue()?.firstLine || ""

    const firstLineInputContainer = document.createElement("div")
    firstLineInputContainer.classList.add("cite-widget-input-container")
    firstLineInputContainer.appendChild(firstLineInputLabel)
    firstLineInputContainer.appendChild(firstLineInput)
    
    citeWidget.appendChild(firstLineInputContainer)

    const lastLineInputLabel = document.createElement('label')
    lastLineInputLabel.for = "last-line"
    lastLineInputLabel.textContent = "Last Line"

    const lastLineInput= document.createElement('input')
    lastLineInput.required = true
    lastLineInput.type = "number"
    lastLineInput.size = "4"
    lastLineInput.value = this.annotation.citeValue()?.lastLine || ""

    const lastLineInputContainer = document.createElement("div")
    lastLineInputContainer.classList.add("cite-widget-input-container")
    lastLineInputContainer.appendChild(lastLineInputLabel)
    lastLineInputContainer.appendChild(lastLineInput)
    citeWidget.appendChild(lastLineInputContainer)

    citeWidget.addEventListener('change', (event) => {
      this.updateCite(event, {
        book: bookSelect.value,
        canto: cantoInput.value,
        firstLine: firstLineInput.value,
        lastLine: lastLineInput.value
      })
    });

    return citeWidget
  }

  this.verseWidget = function() {
    if(!this.annotation.hasValidCiteValue()){
      const emptyDiv = document.createElement('div')
      return emptyDiv
    }

    const verseWidgetEl = document.createElement('div')
    verseWidgetEl.className = "annotation-widget-verse"
    const originalLinesEl = document.createElement('pre')
    const originalLines =
      this.viewer
        .textOg
        .getLines(this.annotation.citeValue().book,
                  this.annotation.citeValue().canto,
                  this.annotation.citeValue().firstLine,
                  this.annotation.citeValue().lastLine)
        .join('\n')

    originalLinesEl.innerHTML = originalLines || ""
    verseWidgetEl.appendChild(originalLinesEl)

    if(this.viewer.textTr){
      const translatedLinesEl = document.createElement('pre')
      const translatedLines =
        this.viewer
          .textTr
          .getLines(this.annotation.citeValue().book,
                    this.annotation.citeValue().canto,
                    this.annotation.citeValue().firstLine,
                    this.annotation.citeValue().lastLine)
          .join('\n')
      translatedLinesEl.innerHTML = translatedLines || ""
      verseWidgetEl.appendChild(translatedLinesEl)
    }

    return verseWidgetEl
  }

  const annotationWidgetContainer = document.createElement('div');
  annotationWidgetContainer.className = 'annotation-widget-container';

  annotationWidgetContainer.appendChild(this.citeWidget())
  annotationWidgetContainer.appendChild(this.verseWidget())
  
  return annotationWidgetContainer;
}

export class CitationViewWidget {
  constructor(annotation, element, viewer){
    this.viewer = viewer
    this.element = element
    this.annotation = new CiteAnnotation(annotation)
    this.annotationRect = getAnnoRect(this.element, this.viewer.osd)
  }

  show(){
    // Return if we already have an overlayElement set
    if(this.overlayElement) return;
    const citationViewContainerEl = document.createElement('div')
    citationViewContainerEl.className = "citation-view-container"
    citationViewContainerEl.appendChild(this.verseWidget())

    let origin = this.annotationRect.getTopLeft();

    this.overlayElement = citationViewContainerEl
    this.viewer.osd.addOverlay(this.overlayElement, origin,
                               OpenSeadragon.Placement.TOP_RIGHT);
    const overlay = this.viewer.osd.getOverlayById(this.overlayElement)

    let annotationAndOverlayRect = this.annotationRect.union(overlay.getBounds(this.viewer.osd.viewport))

    this.viewer.osd.viewport.fitBoundsWithConstraints(annotationAndOverlayRect)
  }

  destroy(){
    this.viewer.osd.removeOverlay(this.overlayElement)
    this.overlayElement = null
  }

  verseWidget() {
    if(!this.annotation.hasValidCiteValue()){
      const emptyDiv = document.createElement('div')
      return emptyDiv
    }

    const verseWidgetEl = document.createElement('div')
    verseWidgetEl.className = "citation-view-verse"
    const originalLinesEl = document.createElement('pre')
    const originalLines =
      this.viewer
        .textOg
        .getLines(this.annotation.citeValue().book,
                  this.annotation.citeValue().canto,
                  this.annotation.citeValue().firstLine,
                  this.annotation.citeValue().lastLine)
        .join('\n')

    originalLinesEl.innerHTML = originalLines || ""
    verseWidgetEl.appendChild(originalLinesEl)

    if(this.viewer.textTr){
      const translatedLinesEl = document.createElement('pre')
      const translatedLines =
        this.viewer
          .textTr
          .getLines(this.annotation.citeValue().book,
                    this.annotation.citeValue().canto,
                    this.annotation.citeValue().firstLine,
                    this.annotation.citeValue().lastLine)
          .join('\n')
      translatedLinesEl.innerHTML = translatedLines || ""
      verseWidgetEl.appendChild(translatedLinesEl)
    }
    
    return verseWidgetEl
  }
}

/** A wrapper for the w3c annotation object provided by annotorious */
class CiteAnnotation {
  constructor(annotation){
    this.annotation = annotation

    this.citeBody = this.annotation
      ? this.annotation.body.find(b => b.purpose === 'describing')
      : null

    this.verseBody = this.annotation
      ? this.annotation.body.find(b => b.purpose === 'linking')
      : null
  }

  citeValue() {
    return this.citeBody ? this.citeBody.value : null
  }

  hasValidCiteValue() {
    if(!this.citeValue() || !this.citeValue()?.book
    || !this.citeValue()?.canto || !this.citeValue()?.firstLine
    || !this.citeValue()?.lastLine){
      return false;
    } else {
      return true
    }
  }
}
