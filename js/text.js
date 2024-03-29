/** @module ./text */

/** Represents a text of the divine comedy sourced from an html file */
export class LaComediaText {
  /**
   * Fetch and parse an HTML encoded text
   * @param {string} sourceURL - The source document to fetch
   */
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

  /**
   * Grab the lines from `firstLine` to `lastLine` in
   * the `canto` of `book`
   * @param {string} book - inferno|purgatorio|paradiso
   * @param {string} canto - Roman numeralized string representing the canto number.
   * @param {string} firstLine - The first line from the given book and canto to be returned.
   * @param {string} lastLine - The last line from the given book and canto to be returned.
   */
  getLines(book, canto, firstLine, lastLine){
    // All params are required
    if(!book || !canto || !firstLine || !lastLine){
      return NaN
    }

    const bookId = bookToRoman(book)

    // Make sure we have a valid bookId
    if(!bookId){
      return NaN
    }

    const cantoSelector = `div.canto#Canto${bookId}\\.${canto}`

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

}

/**
 * Helper method that converts a book name to a roman numeral
 * @param {string} book - inferno|purgatorio|paradiso
 * @returns {string} I|II|III
*/
function bookToRoman(book){
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
