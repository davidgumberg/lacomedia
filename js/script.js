const DrawerStatus = {
    CLOSED: 0,
    OPEN: 1,
}

const DrawerHandleStatus = {
    HIDDEN: 0,
    PEEKING: 1,
    ERECT: 2,
}

// This object is the authority for the state of
// all drawers and the handle 
function Dresser(allDrawers, elDrawerHandle, elDrawerHandleContainer) {
  this.drawers = allDrawers
  this.elHandle = elDrawerHandle
  this.elHandleContainer = elDrawerHandleContainer

  this.primaryDrawer = allDrawers.find((drawer) => drawer.name === 'books')

  this.closeAllDrawers = function(wasAuto = false){
    this.drawers.forEach(drawer => {
      drawer.updateDrawerState(DrawerStatus.CLOSED, wasAuto)
    })
  }

  this.isAnyDrawerOpen = function() {
    return this.drawers.some(drawer => drawer.isOpen())
  }

  this.handleFocusListener = function(_event){
    console.log("handle focus here!")
    this.updateDrawerHandleState(DrawerHandleStatus.HIDDEN)
    this.primaryDrawer.updateDrawerState(DrawerStatus.OPEN)
  }

  this.updateDrawerHandleState = function(handleStatus) {
    // If any drawer is open, the drawer handle should be HIDDEN
    if(this.isAnyDrawerOpen()){
      this.setDrawerHandleState(DrawerHandleStatus.HIDDEN);
    }
    // If the drawer is closed, pass through to setDrawerHandleState
    else if(elDrawerBooks.classList.contains('drawer-closed'))
      this.setDrawerHandleState(handleStatus);
  }

  this.addEventListeners = function() {
    this.elHandleContainer.addEventListener("mouseenter", () => this.updateDrawerHandleState(DrawerHandleStatus.PEEKING))
    this.elHandleContainer.addEventListener("mouseleave", () => this.updateDrawerHandleState(DrawerHandleStatus.HIDDEN))

    this.elHandle.addEventListener("mouseenter", () => this.updateDrawerHandleState(DrawerHandleStatus.ERECT))
    this.elHandle.addEventListener("mouseleave", () => this.updateDrawerHandleState(DrawerHandleStatus.PEEKING))

    // Focusing the drawer handle should open the primary drawer
    this.elHandle.addEventListener("click", (event) => this.handleFocusListener(event))
    this.elHandle.addEventListener("focusin", (event) => this.handleFocusListener(event))
  }

  this.setDrawerHandleState = function(handleStatus) {
    switch(handleStatus) {
      case DrawerHandleStatus.HIDDEN:
        elHandle.classList.add('drawer-handle-hidden')
        elHandle.classList.remove('drawer-handle-peeking')
        elHandle.classList.remove('drawer-handle-erect')
        break;
      case DrawerHandleStatus.PEEKING:
        elHandle.classList.add('drawer-handle-peeking')
        elHandle.classList.remove('drawer-handle-hidden')
        elHandle.classList.remove('drawer-handle-erect')
        break;
      case DrawerHandleStatus.ERECT:
        elHandle.classList.add('drawer-handle-erect')
        elHandle.classList.remove('drawer-handle-hidden')
        elHandle.classList.remove('drawer-handle-peeking')
        break;
    }
  }
}

function Drawer(elDrawer) {
  this.elDrawer = elDrawer
  this.name = elDrawer.dataset.drawer
  this.wasAutoToggled = false

  this.isOpen = function() {
    if (this.elDrawer.classList.contains('drawer-open') 
    && !this.elDrawer.classList.contains('drawer-closed')) {
      return true
    }
    else if (!this.elDrawer.classList.contains('drawer-open')
          &&  this.elDrawer.classList.contains('drawer-closed')){
      return false
    }
    else 
      throw new Error('Invalid drawer state reached');
  }

  this.isClosed = function() {
    return !this.isOpen()
  }

  this.updateDrawerState = function(drawerStatus, wasAuto = false) {
    if (this.setDrawerState(drawerStatus) && wasAuto) {
      this.wasAutoToggled = true;
    } else {
      this.wasAutoToggled = false;
    }
  }

  this.setDrawerState = function(drawerStatus) {
    switch (drawerStatus) {
      case DrawerStatus.CLOSED:
        this.elDrawer.classList.add('drawer-closed');
        this.elDrawer.classList.remove('drawer-open');
        break;
      case DrawerStatus.OPEN:
        this.elDrawer.classList.add('drawer-open');
        this.elDrawer.classList.remove('drawer-closed');
        break;
    }
    return true;
  }
}

const DZ_URL_PREFIX = "https://infernoparadiso.s3.us-east-2.amazonaws.com/"


var viewer = OpenSeadragon({
    id: "osd-1",
    visibilityRatio: 1,
    minZoomImageRatio: 1,
    maxZoomPixelRatio: 42,
    subPixelRoundingForTransparency: 2,
    prefixUrl: "/openseadragon/images/",
    tileSources: DZ_URL_PREFIX + "smb/inferno/VIII.dzi",
    showNavigationControl: false,
    gestureSettingsMouse: {
        clickToZoom: false,
        dblClickToZoom: true,
    },
});

const elDrawerBooks = document.querySelector('[data-drawer="books"]')
const elDrawerInferno = document.querySelector ('[data-drawer="inferno"]')
const elDrawerPurgatorio = document.querySelector ('[data-drawer="purgatorio"]')
const elDrawerParadiso = document.querySelector ('[data-drawer="paradiso"]')

const drawerBooks = new Drawer(elDrawerBooks)
const drawerInferno = new Drawer(elDrawerInferno)
const drawerPurgatorio = new Drawer(elDrawerPurgatorio)
const drawerParadiso = new Drawer(elDrawerParadiso)

const allDrawers = [drawerBooks, drawerInferno, drawerPurgatorio, drawerParadiso]

const elHandleContainer = document.querySelector('[data-drawer="container"]')
const elHandle = document.querySelector('[data-drawer="handle"]')

const DRESSER = new Dresser(allDrawers, elHandle, elHandleContainer)
DRESSER.addEventListeners()

const elInfernoLink = document.querySelector ('[data-book-link="inferno"]')
const elPurgatorioLink = document.querySelector('[data-book-link="purgatorio"]')
const elParadisoLink = document.querySelector ('[data-book-link="paradiso"]')

elInfernoLink.addEventListener   ("click", openBookDrawer)
elPurgatorioLink.addEventListener("click", openBookDrawer)
elParadisoLink.addEventListener  ("click", openBookDrawer)

if(viewportHasBigBlackBars(viewer)){
  drawerBooks.updateDrawerState(DrawerStatus.OPEN, true);
}

const debouncedOsdAnimationHandler = debounce(osdAnimationHandler)

viewer.addHandler("animation", (event) => {
  debouncedOsdAnimationHandler({leading: true, trailing: true, delay: 100}, event)
}, { eventType: "animation" })

//viewer.addHandler("animation-start", osdAnimationHandler, { eventType: "animation-start" });
viewer.addHandler("canvas-scroll", osdAnimationHandler, { eventType: "animation-start" });
viewer.addHandler("canvas-click", osdAnimationHandler, { eventType: "animation-start" });
viewer.addHandler("animation-finish", (event) => {
  debouncedOsdAnimationHandler({leading: false, trailing: true, delay: 200}, event)
}, { eventType: "animation-finish" })

function osdAnimationHandler(event) {
  const evType = event.userData.eventType

  if(!DRESSER.isAnyDrawerOpen() && viewportHasBigBlackBars(viewer)){
    // this is a bad way to go about resetting the timer, 
    // need some kind of an animation queue for the dresser
    clearTimeout(debouncedOsdAnimationHandler.timer)
    DRESSER.updateDrawerHandleState(DrawerHandleStatus.HIDDEN)
    DRESSER.primaryDrawer.updateDrawerState(DrawerStatus.OPEN, true);
  }
  else if(DRESSER.isAnyDrawerOpen() && !viewportHasBigBlackBars(viewer) &&
         (evType === 'animation-start' || DRESSER.primaryDrawer.wasAutoToggled === true)) {
    DRESSER.closeAllDrawers()
  }
         
  if(evType === 'animation'){
    DRESSER.updateDrawerHandleState(DrawerHandleStatus.PEEKING)
  }

  if(evType === 'animation-finish' &&
     !(DRESSER.elHandleContainer.matches(':hover') || DRESSER.elHandle.matches(':hover'))) {
    DRESSER.updateDrawerHandleState(DrawerHandleStatus.HIDDEN)
  }
}

function viewportHasBigBlackBars(viewer) {
  const viewportWidth = viewer.viewport.getBounds().width
  if(viewportWidth >= 1.05){
    return true
  }
  else {
    return false
  }
}

const imageSchemaPath = DZ_URL_PREFIX + 'schema.json';

let imageSchemaJSON
fetch(imageSchemaPath)
  .then(response => response.json())
  .then(data => {
    imageSchemaJSON = data;
    imageSchemaJSON.books.forEach(buildBookLinks)
  })
  .catch(error => {
    console.error('Error loading image schema:', error);
  });


function buildBookLinks(schemaBook){
  const elTargetNav = document.querySelector(`[data-drawer="${schemaBook.name}"] .drawer-contents`)
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
    cantoLink.addEventListener("click", handleCantoLinkClick)

    elTargetNav.appendChild(cantoLink)
  })
}

function openBookDrawer(event){
  const clickedBook = event.target
  const book = clickedBook.dataset.bookLink
  let targetDrawer
  switch(book){
    case 'inferno':
      targetDrawer = drawerInferno
      break;
    case 'purgatorio':
      targetDrawer = drawerPurgatorio
      break;
    case 'paradiso':
      targetDrawer = drawerParadiso
      break;

  }

  DRESSER.closeAllDrawers(false)
  targetDrawer.updateDrawerState(DrawerStatus.OPEN, false)
}

function handleCantoLinkClick(event) {
  const elCantoLink = event.target
  const book = elCantoLink.dataset.book
  const canto = elCantoLink.dataset.canto
  const allVersions = elCantoLink.dataset.cantoVersions.split(', ')

  const defaultVersion = allVersions.find((ver) => ver === 'smb')
                      || allVersions.find((ver) => ver === 'facsimiles')
                      || allVersions.find((ver) => ver === 'vat');

  if(defaultVersion === undefined){
    throw new Error("No valid version could be found for this canto")
  }

  setCanto(book, canto, defaultVersion)
}

function setCanto(book, canto, ver) {
  newCantoParams = new URLSearchParams([["book", book],
                                        ["canto", canto],
                                        ["ver", ver]])

  history.pushState({}, `${book} ${canto}`, '?' + newCantoParams)
  viewer.open(`${DZ_URL_PREFIX}${ver}/${book}/${canto}.dzi`)

  DRESSER.closeAllDrawers(false)
}

/* hoping to use this later... */
function debounce(func) {
  let timer = null
  let trailingArgs = null

  return function debounced(options = {delay: 150, leading: false, trailing: true}, ...args) {
    if (options.leading === undefined) options.leading = false
    if (options.trailing === undefined) options.trailing = true
    if (options.delay === undefined) options.delay = 150

    if (!options.leading && !options.trailing) return () => null
    if (!timer && options.leading) {
      func.apply(this, args)
    } else {
      trailingArgs = args
    }

    clearTimeout(timer)

    timer = setTimeout(() => {
      if (options.trailing && trailingArgs) func.apply(this, trailingArgs)

      trailingArgs = null
      timer = null
    }, options.delay)
  }
}
