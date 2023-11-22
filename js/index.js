import { Dresser, Drawer, DrawerStatus, DrawerHandleStatus } from './dresser.js'
import { Viewer } from './viewer.js'
import { Toolbox } from './toolbox.js'

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
if(viewer.hasBigBlackBars()){
  drawerBooks.updateDrawerState(DrawerStatus.OPEN, true);
}

const toolbox = new Toolbox(document.querySelector('section.toolbox'), viewer)
toolbox.addEventListeners()

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
