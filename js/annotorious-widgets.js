export function TextWidget(args) {
  const viewer = args.viewer

  const currentCiteBody = args.annotation ?
    args.annotation.bodies.find(function(b) {
      return b.purpose == 'describing'
    }) : null;

  const currentVerseBody = args.annotation ?
    args.annotation.bodies.find(function(b) {
      return b.purpose == 'linking'
    }) : null;

  const currentCiteValue = currentCiteBody ? currentCiteBody.value : null

  this.updateCite = function(_event, inputs) {
    if (currentCiteBody) {
      args.onUpdateBody(currentCiteBody, {
        type: 'TextualBody',
        purpose: 'describing',
        value: inputs 
      });
    }
    else { 
      args.onAppendBody({
        type: 'TextualBody',
        purpose: 'describing',
        value: inputs 
      });
    }
  }

  this.updateVerse = function(event) {
    const sel = window.getSelection();
    const range = sel?.rangeCount > 0 ? sel?.getRangeAt(0) : null

    if (currentVerseBody) {
      args.onUpdateBody(currentVerseBody, {
        type: 'TextualBody',
        purpose: 'linking',
        value: event.target.innerHTML
      });
    }
    else { 
      args.onAppendBody({
        type: 'TextualBody',
        purpose: 'linking',
        value: event.target.innerHTML
      });
    }

    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }

  this.citeWidget = function() {
    const citeWidget = document.createElement('div')
    citeWidget.classList.add("cite-widget-container")

    const bookSelect = document.createElement('select')
    bookSelect.name = "book"
    const bookSelectLabel = document.createElement("label")
    bookSelectLabel.for = "book"
    bookSelectLabel.textContent = "Book"

    bookSelect.add(new Option('Inferno', 'inferno'))
    bookSelect.add(new Option('Purgatorio', 'purgatorio'))
    bookSelect.add(new Option('Paradiso', 'paradiso'))

    bookSelect.value = currentCiteValue?.book || "inferno"

    const bookSelectContainer = document.createElement('div')
    bookSelectContainer.classList.add("cite-widget-input-container")
    bookSelectContainer.appendChild(bookSelectLabel)
    bookSelectContainer.appendChild(bookSelect)
    citeWidget.appendChild(bookSelectContainer)

    const cantoInputLabel = document.createElement('label')
    cantoInputLabel.for = "canto"
    cantoInputLabel.textContent = "Canto"
    const cantoInput= document.createElement('input')
    cantoInput.name = "canto"
    cantoInput.required = true
    cantoInput.type = "text"
    cantoInput.size = "10"
    cantoInput.value = currentCiteValue?.canto || ""

    const cantoInputContainer = document.createElement('div')
    cantoInputContainer.classList.add("cite-widget-input-container")
    cantoInputContainer.appendChild(cantoInputLabel)
    cantoInputContainer.appendChild(cantoInput)

    citeWidget.appendChild(cantoInputContainer)

    const firstLineInputLabel = document.createElement('label')
    firstLineInputLabel.for = "first-line"
    firstLineInputLabel.textContent = "First Line"

    const firstLineInput = document.createElement('input')
    firstLineInput.required = true
    firstLineInput.type = "number"
    firstLineInput.size = "4"
    firstLineInput.value = currentCiteValue?.firstLine || ""

    const firstLineInputContainer = document.createElement("div")
    firstLineInputContainer.classList.add("cite-widget-input-container")
    firstLineInputContainer.appendChild(firstLineInputLabel)
    firstLineInputContainer.appendChild(firstLineInput)
    
    citeWidget.appendChild(firstLineInputContainer)

    const lastLineInputLabel = document.createElement('label')
    lastLineInputLabel.for = "last-line"
    lastLineInputLabel.textContent = "Last Line"

    const lastLineInput= document.createElement('input')
    lastLineInput.required = true
    lastLineInput.type = "number"
    lastLineInput.size = "4"
    lastLineInput.value = currentCiteValue?.lastLine || ""

    const lastLineInputContainer = document.createElement("div")
    lastLineInputContainer.classList.add("cite-widget-input-container")
    lastLineInputContainer.appendChild(lastLineInputLabel)
    lastLineInputContainer.appendChild(lastLineInput)
    citeWidget.appendChild(lastLineInputContainer)

    citeWidget.addEventListener('change', (event) => {
      this.updateCite(event, {
        book: bookSelect.value,
        canto: cantoInput.value,
        firstLine: firstLineInput.value,
        lastLine: lastLineInput.value
      })
    });

    return citeWidget
  }

  this.verseWidget = function() {
    if(!currentCiteValue || !currentCiteValue?.book || !currentCiteValue?.canto || !currentCiteValue?.firstLine || !currentCiteValue?.lastLine){
      const emptyDiv = document.createElement('div')
      return emptyDiv
    }
    
    const verseWidgetEl = document.createElement('div')
    verseWidgetEl.className = "annotation-widget-verse"
    const originalLinesEl = document.createElement('pre')
    const originalLines =
      viewer
        .textOg
        .getLines(currentCiteValue.book,
                  currentCiteValue.canto,
                  currentCiteValue.firstLine,
                  currentCiteValue.lastLine)
        .join('\n')
    
    originalLinesEl.innerHTML = originalLines || ""
    verseWidgetEl.appendChild(originalLinesEl)

    if(viewer.textTr){
      const translatedLinesEl = document.createElement('pre')
      const translatedLines =
        viewer
          .textTr
          .getLines(currentCiteValue.book,
                    currentCiteValue.canto,
                    currentCiteValue.firstLine,
                    currentCiteValue.lastLine)
          .join('\n')
      translatedLinesEl.innerHTML = translatedLines || ""
      verseWidgetEl.appendChild(translatedLinesEl)
    }

    return verseWidgetEl
  }

  const annotationWidgetContainer = document.createElement('div');
  annotationWidgetContainer.className = 'annotation-widget-container';

  annotationWidgetContainer.appendChild(this.citeWidget())
  annotationWidgetContainer.appendChild(this.verseWidget())
  
  return annotationWidgetContainer;
}

export function TitleFormatter(_annotation) {
/*
  const currentTitleBody = annotation.bodies.find(function(b) { return b.purpose == 'describing' })
  const currentTitleValue = currentTitleBody ? currentTitleBody.value : null

  return currentTitleValue
*/
  return "eek"
}
