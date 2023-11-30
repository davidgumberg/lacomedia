export function debounce(func) {
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

export function passClickThrough(event) {
  event.target.style.pointerEvents = "none"
  event.target.style.pointerEvents = "auto"
}
