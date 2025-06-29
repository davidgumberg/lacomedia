import { Dresser, Drawer, DrawerStatus, DrawerHandleStatus } from './dresser.js'
import { Viewer } from './viewer.js'
import { Toolbox } from './toolbox.js'

/* Set up drawer links */
const elDrawerBooks = document.querySelector('[data-drawer="books"]')
const elDrawerInferno = document.querySelector ('[data-drawer="inferno"]')
const elDrawerPurgatorio = document.querySelector ('[data-drawer="purgatorio"]')
const elDrawerParadiso = document.querySelector ('[data-drawer="paradiso"]')

const drawers = {
  books: new Drawer(elDrawerBooks),
  inferno: new Drawer(elDrawerInferno),
  purgatorio: new Drawer(elDrawerPurgatorio),
  paradiso: new Drawer(elDrawerParadiso)
}

const elHandleContainer = document.querySelector('[data-drawer="container"]')
const elHandle = document.querySelector('[data-drawer="handle"]')

const dresser = new Dresser(drawers, elHandle, elHandleContainer, elDrawerBooks)
dresser.addEventListeners()

const elInfernoLink = document.querySelector ('[data-book-link="inferno"]')
const elPurgatorioLink = document.querySelector('[data-book-link="purgatorio"]')
const elParadisoLink = document.querySelector ('[data-book-link="paradiso"]')

elInfernoLink.addEventListener   ("click", openBookDrawer)
elPurgatorioLink.addEventListener("click", openBookDrawer)
elParadisoLink.addEventListener  ("click", openBookDrawer)

const viewer = new Viewer(dresser)
// If there's enough room on the sides of the screen, we always show the drawers.
if(viewer.hasBigBlackBars()){
  drawers['books'].updateDrawerState(DrawerStatus.OPEN, true);
}

const toolbox = new Toolbox(document.querySelector('section.toolbox'), viewer)
toolbox.addEventListeners()
viewer.connectToolbox(toolbox)

const elsBackBtn = document.querySelectorAll('a.drawer-headliner')
elsBackBtn.forEach( (backBtn) => {
  backBtn.addEventListener("click", backBtnClickHandler)
})

// The event handler for the back button, closes drawers, opens the book drawer
// if we were inside of a cantos drawer.
function backBtnClickHandler(event){
  const clickedBackFrom = event.currentTarget.dataset.headliner
  dresser.closeAllDrawers()

  // If we were looking at a list of cantos, go back to the book view
  if(clickedBackFrom === 'cantos') {
    dresser.primaryDrawer.updateDrawerState(DrawerStatus.OPEN)
  }
}

function openBookDrawer(event){
  const book = event.target.dataset.bookLink
  let targetDrawer = drawers[book]

  // TODO: This should be internal to dressers/drawers
  dresser.closeAllDrawers(/*was_auto=*/false)
  targetDrawer.updateDrawerState(DrawerStatus.OPEN, false)
}
