import { debounce } from "./util";

export const ToolboxHandleStatus = {
  OPEN: 0,
  CLOSED: 1,
};

export const ToolboxToolsStatus = {
  OPEN: 0,
  CLOSED: 1,
};

export class Toolbox {
  constructor(elToolbox, viewer){
    this._viewer = viewer

    this.elToolbox = elToolbox

    this.elPrevBtn = this.elToolbox.querySelector('[data-toolbox="prev-btn"]')
    this.elNextBtn = this.elToolbox.querySelector('[data-toolbox="next-btn"]')
    this.elToolboxHandle = this.elToolbox.querySelector('.toolbox-handle')
    this.elToolboxTools = this.elToolbox.querySelector('.toolbox-tools')
    this.elToolboxToolsOpenBtn = this.elToolboxTools.querySelector('.toolbox-tools-open-btn')
    this.elToolboxToolsAnnotationsSaveBtn = this.elToolboxTools.querySelector('.toolbox-tools-save-annotations')
  }
  
  closeToolboxHandle() {
    this.setToolboxHandleState(ToolboxHandleStatus.CLOSED)
    this.setToolboxToolsState(ToolboxToolsStatus.CLOSED)
  }

  openToolboxHandle() {
    this.setToolboxHandleState(ToolboxHandleStatus.OPEN)
    this.setToolboxToolsState(ToolboxToolsStatus.CLOSED)
  }

  toggleToolboxTools() {
    if(this.elToolboxTools.classList.contains('toolbox-tools-open')){
      this.setToolboxToolsState(ToolboxToolsStatus.CLOSED)
    }
    else if(this.elToolboxTools.classList.contains('toolbox-tools-closed')){
      this.setToolboxToolsState(ToolboxToolsStatus.OPEN)
    }
  }

  elPrevBtnListener(_event) {
    this._viewer.setCantoToPrev()
  }

  elNextBtnListener(_event) {
    this._viewer.setCantoToNext()
  }

  elToggleBtnListener(_event) {
    this.toggleToolboxTools();
  }

  async saveAnnotationsListener(_event) {
    const blob = new Blob([JSON.stringify(this._viewer.anno.getAllAnnotations())], {
      type: 'text/plain'
    });
    const blobUrl = URL.createObjectURL(blob)
    let link = document.createElement("a")
    link.href = blobUrl;
    link.download = "annotations.json"
    link.click()
    
    URL.revokeObjectURL(blobUrl)
  }

  isHovered() {
    return (this.elToolbox.matches(':hover')) ? true : false
  }

  addEventListeners() {
    this.elPrevBtn.addEventListener("click", (event) => this.elPrevBtnListener(event))
    this.elNextBtn.addEventListener("click", (event) => this.elNextBtnListener(event))
    this.elToolboxToolsOpenBtn.addEventListener("click", (event) => this.elToggleBtnListener(event))
    this.elToolboxToolsAnnotationsSaveBtn.addEventListener("click", (event) => this.saveAnnotationsListener(event))
    this.elToolbox.addEventListener("mouseenter", () => this.setToolboxHandleState(ToolboxHandleStatus.OPEN))
    this.elToolbox.addEventListener("mouseleave", () => this.setToolboxHandleState(ToolboxHandleStatus.CLOSED))
  }

  setToolboxHandleState(status) {
    if(status === ToolboxHandleStatus.OPEN){
      this.elToolboxHandle.classList.add('toolbox-handle-open')
      this.elToolboxHandle.classList.remove('toolbox-handle-closed')
    }
    else if(status === ToolboxHandleStatus.CLOSED){
      this.elToolboxHandle.classList.add('toolbox-handle-closed')
      this.elToolbox.classList.remove('toolbox-handle-open')
    }
  }

  setToolboxToolsState(status) {
    if(status === ToolboxToolsStatus.OPEN){
      this.elToolboxTools.classList.add('toolbox-tools-open')
      this.elToolboxTools.classList.remove('toolbox-tools-closed')
    }
    else if(status === ToolboxToolsStatus.CLOSED){
      this.elToolboxTools.classList.add('toolbox-tools-closed')
      this.elToolboxTools.classList.remove('toolbox-tools-open')
    }
  }
}
