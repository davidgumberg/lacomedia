import { Dresser, Drawer, DrawerStatus, DrawerHandleStatus } from './dresser.js'
import { Viewer } from './viewer.js'
import { Toolbox } from './toolbox.js'
import { LaComediaText } from './text.js'

const DZ_URL_PREFIX = "https://infernoparadiso.s3.us-east-2.amazonaws.com/"
// const DZ_URL_PREFIX = "images/"

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

const dresser = new Dresser(allDrawers, elHandle, elHandleContainer, elDrawerBooks)
dresser.addEventListeners()

const elInfernoLink = document.querySelector ('[data-book-link="inferno"]')
const elPurgatorioLink = document.querySelector('[data-book-link="purgatorio"]')
const elParadisoLink = document.querySelector ('[data-book-link="paradiso"]')

elInfernoLink.addEventListener   ("click", openBookDrawer)
elPurgatorioLink.addEventListener("click", openBookDrawer)
elParadisoLink.addEventListener  ("click", openBookDrawer)

const viewer = new Viewer(dresser)

const toolbox = new Toolbox(document.querySelector('section.toolbox'), viewer)
toolbox.addEventListeners()

if(viewer.hasBigBlackBars()){
  drawerBooks.updateDrawerState(DrawerStatus.OPEN, true);
}

const debouncedOsdAnimationHandler = debounce(osdAnimationHandler)

viewer.osd.addHandler("animation", (event) => {
  debouncedOsdAnimationHandler({leading: true, trailing: true, delay: 100}, event)
}, { eventType: "animation" })

//viewer.osd.addHandler("animation-start", osdAnimationHandler, { eventType: "animation-start" });
viewer.osd.addHandler("canvas-scroll", osdAnimationHandler, { eventType: "animation-start" });
viewer.osd.addHandler("canvas-click", osdAnimationHandler, { eventType: "animation-start" });
viewer.osd.addHandler("animation-finish", (event) => {
  debouncedOsdAnimationHandler({leading: false, trailing: true, delay: 200}, event)
}, { eventType: "animation-finish" })

const elsBackBtn = document.querySelectorAll('a.drawer-headliner')
elsBackBtn.forEach( (backBtn) => {
  backBtn.addEventListener("click", backBtnClickHandler)
})

function backBtnClickHandler(event){
  clickedLink = event.currentTarget.dataset.headliner
  if(clickedLink === 'books'){
    dresser.closeAllDrawers()
  }
  else if(clickedLink === 'cantos') {
    dresser.closeAllDrawers()
    dresser.primaryDrawer.updateDrawerState(DrawerStatus.OPEN)
  }
}

function osdAnimationHandler(event) {
  const evType = event.userData.eventType

  if(!dresser.isAnyDrawerOpen() && viewer.hasBigBlackBars()){
    // this is a bad way to go about resetting the timer, 
    // need some kind of an animation queue for the dresser
    clearTimeout(debouncedOsdAnimationHandler.timer)
    dresser.updateDrawerHandleState(DrawerHandleStatus.HIDDEN)
    dresser.primaryDrawer.updateDrawerState(DrawerStatus.OPEN, true);
  }
  else if(dresser.isAnyDrawerOpen() && !viewer.hasBigBlackBars() &&
         (evType === 'animation-start' || dresser.primaryDrawer.wasAutoToggled === true)) {
    dresser.closeAllDrawers()
  }
         
  if(evType === 'animation'){
    dresser.updateDrawerHandleState(DrawerHandleStatus.PEEKING)
  }

  if(evType === 'animation-finish' &&
     !(dresser.elHandleContainer.matches(':hover') || dresser.elHandle.matches(':hover'))) {
    dresser.updateDrawerHandleState(DrawerHandleStatus.HIDDEN)
  }
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

  dresser.closeAllDrawers(false)
  targetDrawer.updateDrawerState(DrawerStatus.OPEN, false)
}

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
