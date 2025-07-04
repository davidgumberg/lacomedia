import OpenSeadragon from 'openseadragon'

// Import annotorious and CSS
import * as Annotorious from '@recogito/annotorious-openseadragon'
import BetterPolygon from '@recogito/annotorious-better-polygon'
import { fitBoundsWithWidget } from './annoviewer-plugin'

import { CitationEditWidget, CitationViewWidget } from './annotorious-widgets'
import { LaComediaText } from './text'
import SequenceModePlugin from './sequence-mode-plugin'

import { DrawerHandleStatus, DrawerStatus } from './dresser'
import { debounce } from './util'

const DZ_URL_PREFIX = "https://infernoparadiso.s3.us-east-2.amazonaws.com/"
const imageSchemaPath = DZ_URL_PREFIX + 'schema.json';

const STARTING_IMAGE = {book: 'inferno', canto: 'VIII', ver: 'smb'}

/** This mega-class wraps the OSD viewer, the annotorious widgets, and all of our custom
 * controls and widgets. */
export class Viewer{
  constructor(dresser, toolbox, startingImage = STARTING_IMAGE){
    this.dresser = dresser
    this.toolbox = toolbox
    this.image = startingImage

    this.osd = OpenSeadragon({
      id: "osd-element",
      visibilityRatio: 1,
      minZoomImageRatio: 1,
      maxZoomPixelRatio: 41,
      tileSources: this._imagePath(),
      showNavigationControl: false,
      gestureSettingsMouse: {
          clickToZoom: false,
          dblClickToZoom: true,
      },
      crossOriginPolicy: 'Anonymous',
    });

    this.addEventListeners()

    fetch(imageSchemaPath)
      .then(response => response.json())
      .then(data => {
        this.imageSchema = data
        this.imageSchema.books.forEach((book) => this._buildBookLinks(book))
      })
      .catch(error => {
        console.error('Error loading image schema:', error);
      });

    this.textOg = new LaComediaText(`${window.location.origin + window.location.pathname}/assets/it.html`)
    this.textTr = new LaComediaText(`${window.location.origin + window.location.pathname}/assets/en.html`)

    this.anno = Annotorious.default(this.osd, {
      widgets: [
        { widget: CitationEditWidget, viewer: this }
      ],
    });

    fetch(`${window.location.origin + window.location.pathname}/assets/annotations.json`)
      .then(response => response.json())
      .then(data => {
        SequenceModePlugin(this.anno, this, {pagedAnnotations: data})
      })
    BetterPolygon(this.anno);
    this.anno.setDrawingTool('polygon')

    this.annotationsVisible = true
    this.anno.setVisible(true)
    this.anno.readOnly = true
    this.anno.disableEditor = true
    
    this.anno.on('selectAnnotation', (annotation, element) => {
      // Fit bounds on annote selection
      if(this.anno.disableEditor == false){
        fitBoundsWithWidget(element, null, this.osd)
      }

      // If editor is disabled, show our custom cite widget
      if(this.anno.disableEditor == true){
        let citeviewer = new CitationViewWidget(annotation, element, this)
        citeviewer.show()
        this.anno.on('cancelSelected', function(_selection) {
          citeviewer.destroy()
        })
      }
    })
  }

  /** Sets image to the book, canto and version provided. Used by the setCantotoNext() and prev
   * and by the dresser Canto menu */
  setCanto(book, canto, ver = undefined) {
    if(ver === undefined){
      const schemaBook = this.imageSchema.books.find((i) => i.name === book)
      if(schemaBook === undefined){
        throw `No such book ${book} found`
      }

      const schemaCanto = schemaBook.cantos.find((i) => i.name === canto)
      if(schemaCanto === undefined){
        throw `No such canto ${canto} found`
      }

      const cantoVersions = schemaCanto.versions
      ver = (cantoVersions.find((ver) => ver.name === 'smb') || cantoVersions.find((ver) => ver.name === 'facsimiles')).name
    }

    this.image = {book: book, canto: canto, ver: ver}
    this.osd.open(this._imagePath())

    const newCantoParams = new URLSearchParams([["book", book],
                                          ["canto", canto],
                                          ["ver", ver]])
    history.pushState({}, `${book} ${canto}`, '?' + newCantoParams)
  }

  toggleEditor() {
    if(this.anno.readOnly == false) {
      this.anno.readOnly = true
      this.anno.disableEditor = true
    }
    else {
      this.anno.readOnly = false
      this.anno.disableEditor = false
    }
  }

  toggleAnnotations() {  
    if(this.annotationsVisible == true){
      this.annotationsVisible = false
      this.anno.setVisible(false)
      this.anno.readOnly = true
      this.anno.disableEditor = true
    }
    else {
      this.annotationsVisible = true
      this.anno.setVisible(true)
      this.anno.readOnly = true
      this.anno.disableEditor = false
    }
  }

  setCantoToNext() {
    const schemaBook = this.imageSchema.books.find((schemaBook) => schemaBook.name === this.image.book)
    const cantoIdx = schemaBook.cantos.findIndex((schemaCanto) => schemaCanto.name === this.image.canto)

    // If it's the last canto of the book, see if we can set it to the first of the next book
    if (cantoIdx === schemaBook.cantos.length-1) {
      let schemaNextBook 
      if(this.image.book === "inferno"){
        schemaNextBook = this.imageSchema.books.find((schemaBook) => schemaBook.name === "purgatorio")
      }
      else if(this.image.book === "purgatorio"){
        schemaNextBook = this.imageSchema.books.find((schemaBook) => schemaBook.name === "paradiso")
      }
      else{
        // Don't go to the next book if we're in paradiso.
        return
      }
      this.setCanto(schemaNextBook.name, schemaNextBook.cantos[0].name)
    }
    else {
      this.setCanto(schemaBook.name, schemaBook.cantos[cantoIdx + 1].name)
    }
  }

  setCantoToPrev() {
    const schemaBook = this.imageSchema.books.find((schemaBook) => schemaBook.name === this.image.book)
    const cantoIdx = schemaBook.cantos.findIndex((schemaCanto) => schemaCanto.name === this.image.canto)

    // If it's the first canto of the book, see if we can set it to the last of the prev book
    if (cantoIdx === 0) {
      let schemaPrevBook
      if(this.image.book === "purgatorio"){
        schemaPrevBook = this.imageSchema.books.find((schemaBook) => schemaBook.name === "inferno")
      }
      else if(this.image.book === "paradiso"){
        schemaPrevBook = this.imageSchema.books.find((schemaBook) => schemaBook.name === "purgatorio")
      }
      else{
        // Don't go to the previous book if we're in inferno.
        return
      }
      this.setCanto(schemaPrevBook.name, schemaPrevBook.cantos[schemaPrevBook.length-1].name)
    }
    else {
      this.setCanto(schemaBook.name, schemaBook.cantos[cantoIdx - 1].name)
    }
  }

  hasBigBlackBars() {
    const viewportWidth = this.osd.viewport.getBounds().width
    if(viewportWidth >= 1.06){
      return true
    }
    else {
      return false
    }
  }

  addEventListeners() {
    this.debouncedOsdAnimationHandler = debounce(this._osdAnimationHandler.bind(this))

    this.osd.addHandler("animation", (_event) => {
      this.debouncedOsdAnimationHandler({leading: true, trailing: true, delay: 0}, "animation")
    })

    this.osd.addHandler("animation-start", (_event) => {
      this.debouncedOsdAnimationHandler({leading: true, trailing: true, delay: 0}, "animation-start")
    })

    // Canvas click is identically handled to animation-start
    this.osd.addHandler("canvas-click", (_event) => {
      this.debouncedOsdAnimationHandler({leading: true, trailing: true, delay: 0}, "animation-start")
    })

    this.osd.addHandler("animation-finish", (_event) => {
      this.debouncedOsdAnimationHandler({leading: false, trailing: true, delay: 200}, "animation-finish")
    })
  }

  connectToolbox(toolbox) {
    this.toolbox = toolbox
  }

  _handleCantoLinkClick(event) {
    const elCantoLink = event.target
    const book = elCantoLink.dataset.book
    const canto = elCantoLink.dataset.canto
    const allVersions = elCantoLink.dataset.cantoVersions.split(', ')

    const defaultVersion = allVersions.find((ver) => ver === 'smb') || allVersions.find((ver) => ver === 'facsimiles')
    if(defaultVersion === undefined){
      throw new Error("No valid version could be found for this canto")
    }

    this.setCanto(book, canto, defaultVersion)
    this.dresser.closeAllDrawers(false)
  }

  _osdAnimationHandler(evType) {
    if(!this.dresser.isAnyDrawerOpen() && this.hasBigBlackBars()){
      clearTimeout(this.debouncedOsdAnimationHandler.timer)
      this.dresser.updateDrawerHandleState(DrawerHandleStatus.HIDDEN)
      this.dresser.primaryDrawer.updateDrawerState(DrawerStatus.OPEN, true);


      this.toolbox.openToolboxHandle();
      return;
    }

    else if(this.dresser.isAnyDrawerOpen() && !this.hasBigBlackBars() &&
           (evType === 'animation-start' || this.dresser.primaryDrawer.wasAutoToggled === true)) {
      this.dresser.closeAllDrawers()
      this.toolbox.closeToolboxHandle();
    }
           
    if(evType === 'animation'){
      this.dresser.updateDrawerHandleState(DrawerHandleStatus.PEEKING)
      this.toolbox.openToolboxHandle();
    }

    if(evType === 'animation-finish'){
      if(!this.dresser.isHovered()){
        this.dresser.updateDrawerHandleState(DrawerHandleStatus.HIDDEN)
      }
      if(!this.toolbox.isHovered()){
        this.toolbox.closeToolboxHandle();
      }
    }
  }

  // This is a layer violation!
  /* Assemble and append links to all the canto images */
  _buildBookLinks(schemaBook) {
    const elTargetDiv =
      this.dresser
        .drawers[schemaBook.name]
        .drawer.el
        .querySelector('.drawer-contents')

    schemaBook.cantos.forEach(canto => {
      const cantoLink = document.createElement("a")
      cantoLink.setAttribute("data-book", schemaBook.name)
      cantoLink.setAttribute("data-canto", canto.name)

      const cantoVersionsString = canto.versions.reduce((acc, curr) => {
        // initial iteration
        if (acc === ""){
          return curr.name
        }
        else {
          return acc + ", " + curr.name
        }
      }, "")
        
      cantoLink.setAttribute("data-canto-versions", cantoVersionsString)
      const cantoName = document.createTextNode(canto.name)
      cantoLink.appendChild(cantoName)
      cantoLink.addEventListener("click", (event) => this._handleCantoLinkClick(event))

      elTargetDiv.appendChild(cantoLink)
    })
  }

  /* utility function that returns the .dzi filepath for a given image */
  _imagePath() {
    return(`${DZ_URL_PREFIX}${this.image.ver}/${this.image.book}/${this.image.canto}.dzi`)
  }
}
