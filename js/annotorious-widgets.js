export function TitleWidget(args) {
  const currentTitleBody = args.annotation ?
    args.annotation.bodies.find(function(b) {
      return b.purpose == 'describing'
    }) : null;

  const currentVerseBody = args.annotation ?
    args.annotation.bodies.find(function(b) {
      return b.purpose == 'linking'
    }) : null;

  const currentTitleValue = currentTitleBody ? currentTitleBody.value : null
  const currentVerseValue = currentVerseBody ? currentVerseBody.value : null

  this.updateTitle = function(event) {
    if (currentTitleBody) {
      args.onUpdateBody(currentTitleBody, {
        type: 'TextualBody',
        purpose: 'describing',
        value: event.target.value
      });
    }
    else { 
      args.onAppendBody({
        type: 'TextualBody',
        purpose: 'describing',
        value: event.target.value
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

  this.titleWidget = function() {
    const titleWidget = document.createElement('input')
    titleWidget.type = "text"
    titleWidget.value = currentTitleValue

    titleWidget.addEventListener('change', this.updateTitle)
    return titleWidget
  }

  this.italianVerseWidget = function() {
    const verseWidget = document.createElement('span')
    verseWidget.className = "annotation-widget-verse"
    verseWidget.role = "textbox"
    verseWidget.innerHTML = currentVerseValue
    verseWidget.contentEditable = true

    verseWidget.addEventListener('blur', this.updateVerse)
    return verseWidget
  }

  const AnnotationWidgetContainer= document.createElement('div');
  AnnotationWidgetContainer.className = 'annotation-widget-container';

  AnnotationWidgetContainer.appendChild(this.titleWidget())
  AnnotationWidgetContainer.appendChild(this.italianVerseWidget())
  
  return AnnotationWidgetContainer;
}

export function TitleFormatter(annotation) {
  const currentTitleBody = annotation.bodies.find(function(b) { return b.purpose == 'describing' })
  const currentTitleValue = currentTitleBody ? currentTitleBody.value : null

  return currentTitleValue
}
