export const DrawerStatus = {
    CLOSED: 'drawer-close',
    OPEN: 'drawer-open',
}

export const DrawerHandleStatus = {
    HIDDEN: 'drawer-handle-hidden',
    PEEKING: 'drawer-handle-peeking',
    ERECT: 'drawer-handle-erect',
}

/**
 * A utility class that takes an element and a list of exclusive CSS classes that
 * represent some state for the element.
 */
class ElementAndState {
    constructor(element, states) {
        this.el = element;
        this.states = Object.values(states);
    }

    /** When you set one state remove every other state from the element
     *  and add that one.
     */
    setState(newState) {
        // Remove all possible states
        this.states.forEach(state => {
            this.el.classList.remove(`${state}`);
        });
        
        // Add the new state
        this.el.classList.add(`${newState}`);
    }

    getState() {
      for (const state of this.states) {
        if(this.el.classList.contains(state)) {
          return state
        }
      }
    }
}

// TODO: drop passed elements
// the dresser should be in charge of it's own assembly,
// no need for it to be generic
export class Dresser {
  constructor(allDrawers, elDrawerHandle, elDrawerHandleContainer) {
    this.drawers = allDrawers
    this.elHandleContainer = elDrawerHandleContainer
    this.drawerHandle = new ElementAndState(elDrawerHandle, DrawerHandleStatus)

    this.primaryDrawer = this.drawers['books']
  }

  closeAllDrawers(wasAuto = false) {
    for (const drawer of Object.values(this.drawers)) {
      drawer.updateDrawerState(DrawerStatus.CLOSED, wasAuto)
    }
  }

  isAnyDrawerOpen() {
    for (const drawer of Object.values(this.drawers)) {
      if (drawer.isOpen()) return true
    }

    return false
  }

  handleFocusListener(_event){
    this.updateDrawerHandleState(DrawerHandleStatus.HIDDEN)
    this.primaryDrawer.updateDrawerState(DrawerStatus.OPEN)
  }

  updateDrawerHandleState(handleStatus) {
    // If any drawer is open, the drawer handle should be HIDDEN, ignore the status.
    if(this.isAnyDrawerOpen()){
      this.drawerHandle.setState(DrawerHandleStatus.HIDDEN)
    }
    else {
      // Pass through to setState
      this.drawerHandle.setState(handleStatus)
    }
  }

  isHovered() {
    return this.elHandleContainer.matches(':hover') || this.drawerHandle.el.matches(':hover')
  }

  addEventListeners() {
    this.elHandleContainer.addEventListener("mouseenter", () => this.updateDrawerHandleState(DrawerHandleStatus.PEEKING))
    this.elHandleContainer.addEventListener("mouseleave", () => this.updateDrawerHandleState(DrawerHandleStatus.HIDDEN))

    this.drawerHandle.el.addEventListener("mouseenter", () => this.updateDrawerHandleState(DrawerHandleStatus.ERECT))
    this.drawerHandle.el.addEventListener("mouseleave", () => this.updateDrawerHandleState(DrawerHandleStatus.PEEKING))

    // Focusing the drawer handle should open the primary drawer
    this.drawerHandle.el.addEventListener("click", (event) => this.handleFocusListener(event))
    this.drawerHandle.el.addEventListener("focusin", (event) => this.handleFocusListener(event))
  }
}

export class Drawer {
  constructor(elDrawer) {
    this.drawer = new ElementAndState(elDrawer, DrawerStatus)
    this.name = elDrawer.dataset.drawer
    this.wasAutoToggled = false
  }

  isOpen() {
    return this.drawer.getState() == DrawerStatus.OPEN
  }

  isClosed() {
    return !this.isOpen()
  }

  updateDrawerState(drawerStatus, wasAuto = false) {
    this.drawer.setState(drawerStatus)
    this.wasAutoToggled = wasAuto
  }
}

export function BookDrawer(elDrawer) {
  Object.setPrototypeOf(this, Drawer)
}
