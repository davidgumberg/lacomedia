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
    const cantoSelector = `div.canto#Canto${this.bookToRoman(book)}\\.${canto}`
    const cantoText = this.textDocument.querySelector(cantoSelector).innerText
    return cantoText.trim().split(/(?:\n\s*)/).slice((firstLine - 1), (lastLine - 1))
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
