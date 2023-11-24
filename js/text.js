export class LaComediaText {
  constructor(sourceURL) {
    fetch(sourceURL)
      .then(response => {
        if(!response.ok) {
          throw new Error(`HTTP Error: Status: ${response.status}`)
        }

        return response.text()
      })
      .then(text => {
        const parser = new DOMParser()
        this.textDocument = parser.parseFromString(text, 'text/html')
      })
  }

  getLines(book, canto, firstLine, lastLine){
    if(!book || !canto || !firstLine || !lastLine){
      return NaN;
    }

    const cantoSelector = `div.canto#Canto${this.bookToRoman(book)}\\.${canto}`

    // This could be made more efficient with a single loop if 
    // performance turns out to be an issue here (doubtful)

    let cantoLines = this.textDocument.querySelector(cantoSelector).innerText
    cantoLines = cantoLines.trim().split(/(?:\n\s*)/).slice((firstLine - 1), (lastLine - 1))
    cantoLines = cantoLines.flatMap( (line, index) => {
      const currLine = firstLine + index
      if(currLine % 3 == 0) {
        return [line, "\n"]
      }
      else {
        return line
      }
    })

    return cantoLines
  }

  bookToRoman(book){
    switch(book.toLowerCase()){
      case 'inferno':
        return 'I'
      case 'purgatorio':
        return 'II'
      case 'paradiso':
        return 'III'
      default:
        return NaN
    }
  }
}
