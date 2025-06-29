/**
 * Utility module
 * @module ./util
 */

/**
 * Home-cooked 'debounce' that is more like an event queue that only holds
 * the event most recently passed to it.
 *
 * @param {function} func - The function for which a debounce 'queue' should be setup
 * @returns {function(*)} - The new queue to which we will pass events
 */
export function debounce(func) {
  let timer = null
  let trailingArgs = null

  return function debounced(options = {delay: 150, leading: false, trailing: true}, ...args) {
    if (options.delay === undefined) options.delay = 150
    if (options.leading === undefined) options.leading = false
    if (options.trailing === undefined) options.trailing = true

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

/**
 * A utility class that takes an element and a list of exclusive CSS classes that
 * represent some state for the element.
 */
export class ElementAndState {
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

