export const DrawerStatus = {
    CLOSED: 0,
    OPEN: 1,
}

export const DrawerHandleStatus = {
    HIDDEN: 0,
    PEEKING: 1,
    ERECT: 2,
}

// TODO: drop elDrawerBooks and maybe all other passed elements,
// the dresser should be in charge of it's own assembly,
// no need for it to be generic
export function Dresser(allDrawers, elDrawerHandle, elDrawerHandleContainer, elDrawerBooks) {
  this.drawers = allDrawers
  this.elHandle = elDrawerHandle
  this.elHandleContainer = elDrawerHandleContainer
  this.elDrawerBooks = elDrawerBooks

  this.primaryDrawer = this.drawers.find((drawer) => drawer.name === 'books')

  this.closeAllDrawers = function(wasAuto = false){
    this.drawers.forEach(drawer => {
      drawer.updateDrawerState(DrawerStatus.CLOSED, wasAuto)
    })
  }

  this.isAnyDrawerOpen = function() {
    return this.drawers.some(drawer => drawer.isOpen())
  }

  this.handleFocusListener = function(_event){
    this.updateDrawerHandleState(DrawerHandleStatus.HIDDEN)
    this.primaryDrawer.updateDrawerState(DrawerStatus.OPEN)
  }

  this.updateDrawerHandleState = function(handleStatus) {
    // If any drawer is open, the drawer handle should be HIDDEN
    if(this.isAnyDrawerOpen()){
      this.setDrawerHandleState(DrawerHandleStatus.HIDDEN);
    }
    // If the drawer is closed, pass through to setDrawerHandleState
    else if(this.elDrawerBooks.classList.contains('drawer-closed'))
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
        this.elHandle.classList.add('drawer-handle-hidden')
        this.elHandle.classList.remove('drawer-handle-peeking')
        this.elHandle.classList.remove('drawer-handle-erect')
        break;
      case DrawerHandleStatus.PEEKING:
        this.elHandle.classList.add('drawer-handle-peeking')
        this.elHandle.classList.remove('drawer-handle-hidden')
        this.elHandle.classList.remove('drawer-handle-erect')
        break;
      case DrawerHandleStatus.ERECT:
        this.elHandle.classList.add('drawer-handle-erect')
        this.elHandle.classList.remove('drawer-handle-hidden')
        this.elHandle.classList.remove('drawer-handle-peeking')
        break;
    }
  }

}

export function Drawer(elDrawer) {
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

export function BookDrawer(elDrawer) {
  Object.setPrototypeOf(this, Drawer)
}