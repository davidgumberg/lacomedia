import OpenSeadragon from 'openseadragon'

// Import annotorious and CSS
import * as Annotorious from '@recogito/annotorious-openseadragon'
import BetterPolygon from '@recogito/annotorious-better-polygon'

import { TitleFormatter, CiteWidget } from './annotorious-widgets'
import { LaComediaText } from './text.js'

import SequenceModePlugin from './sequence-mode-plugin'

import { DrawerHandleStatus, DrawerStatus } from './dresser'
import { debounce } from './util'

const DZ_URL_PREFIX = "https://infernoparadiso.s3.us-east-2.amazonaws.com/"
const imageSchemaPath = DZ_URL_PREFIX + 'schema.json';

export class Viewer{
  constructor(dresser, startingImage = {book: 'inferno', canto: 'VIII', ver: 'smb'}){
    this.dresser = dresser

    this.image = startingImage

    this.osd = OpenSeadragon({
      id: "osd-element",
      visibilityRatio: 1,
      minZoomImageRatio: 1,
      maxZoomPixelRatio: 41,
      tileSources: this.imagePath(),
      showNavigationControl: false,
      gestureSettingsMouse: {
          clickToZoom: false,
          dblClickToZoom: true,
      },
    });

    this.addEventListeners()

    fetch(imageSchemaPath)
      .then(response => response.json())
      .then(data => {
        this.imageSchema = data
        this.imageSchema.books.forEach((book) => this.buildBookLinks(book))
      })
      .catch(error => {
        console.error('Error loading image schema:', error);
      });

    this.anno = Annotorious.default(this.osd, {
      widgets: [
        CiteWidget
      ],
      formatter: TitleFormatter
    });

    fetch(`${window.location.origin}/assets/annotations.json`)
      .then(response => response.json())
      .then(data => {
        SequenceModePlugin(this.anno, this, {pagedAnnotations: data})
      })
    BetterPolygon(this.anno);
    this.anno.setDrawingTool('polygon')
  }

  imagePath() {
    return(`${DZ_URL_PREFIX}${this.image.ver}/${this.image.book}/${this.image.canto}.dzi`)
  }

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
    this.osd.open(this.imagePath())

    const newCantoParams = new URLSearchParams([["book", book],
                                          ["canto", canto],
                                          ["ver", ver]])
    history.pushState({}, `${book} ${canto}`, '?' + newCantoParams)
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
        throw "nextCanto() called when it shouldn't have been"
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
        throw "prevCanto() called when it shouldn't have been"
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

  buildBookLinks(schemaBook) {
    const elTargetDiv =
      this.dresser
        .drawers.find((drawer) => drawer.name === schemaBook.name)
        .elDrawer
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

  addEventListeners() {
    this.debouncedOsdAnimationHandler = debounce(this._osdAnimationHandler.bind(this))

    this.osd.addHandler("animation", (event) => {
      this.debouncedOsdAnimationHandler({leading: true, trailing: true, delay: 100}, event)
    }, { eventType: "animation" })

    this.osd.addHandler("animation-finish", (event) => {
      this.debouncedOsdAnimationHandler({leading: false, trailing: true, delay: 200}, event)
    }, { eventType: "animation-finish" })

    this.osd.addHandler("canvas-click", (event) => {
      this.debouncedOsdAnimationHandler({leading: true, trailing: true, delay: 0}, event)
    }, { eventType: "animation-start" });

    //this.osd.addHandler("canvas-scroll", this._osdAnimationHandler, { eventType: "animation-start" });
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

  _osdAnimationHandler(event) {
    const evType = event.userData.eventType

    if(!this.dresser.isAnyDrawerOpen() && this.hasBigBlackBars()){
      // this is a bad way to go about resetting the timer, 
      // need some kind of an animation queue for the dresser
      clearTimeout(this.debouncedOsdAnimationHandler.timer)
      this.dresser.updateDrawerHandleState(DrawerHandleStatus.HIDDEN)
      this.dresser.primaryDrawer.updateDrawerState(DrawerStatus.OPEN, true);
    }
    else if(this.dresser.isAnyDrawerOpen() && !this.hasBigBlackBars() &&
           (evType === 'animation-start' || this.dresser.primaryDrawer.wasAutoToggled === true)) {
      this.dresser.closeAllDrawers()
    }
           
    if(evType === 'animation'){
      this.dresser.updateDrawerHandleState(DrawerHandleStatus.PEEKING)
    }

    if(evType === 'animation-finish' &&
       !(this.dresser.elHandleContainer.matches(':hover') || this.dresser.elHandle.matches(':hover'))) {
      this.dresser.updateDrawerHandleState(DrawerHandleStatus.HIDDEN)
    }
  }
}
