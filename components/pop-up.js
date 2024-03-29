import PanelBase from "./panel-base.js";
import svgIcon from "../svg-icons.js";
import { addCSS, createKMNElement, kmnClassName } from "../../KMN-varstack-browser/utils/html-utils.js";

const cssStr = /*css*/`
.${kmnClassName} {
  --popupHeaderHeight: 32px;
  --popupMargin: 4px;
}
.${kmnClassName}.popupArea {
  position: fixed;
  display: block;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  z-index: 10;
}
.${kmnClassName}.popupContent {
  background: var(--backgroundColor);
  width: 80%;
  max-width: 800px;
  height: 80%;
  max-height: 1000px;
  left: 50%;
  top: 50%;
  border: 1px solid var(--subHeaderBackground);
  transform: translate(-50%,-50%);
}

.${kmnClassName}.popupHeader {
  background: var(--subHeaderBackground);
  color: var(--subHeaderColor);
  left: 0;
  top: 0;
  width: 100%;
  height: calc(var(--popupHeaderHeight) - 1px);
  border-bottom: 1px solid var(--borderColor);
}

.${kmnClassName}.popupTitle {
  left: var(--popupMargin);
  font-size: calc(var(--popupHeaderHeight) * 0.6);
  line-height: var(--popupHeaderHeight);
}

.${kmnClassName}.popupHeader .close {
  position: absolute;
  right: 0;
  top: 2px;
  width: calc(var(--popupHeaderHeight) - 4px);
  height: calc(var(--popupHeaderHeight) - 4px);
  stroke: var(--subHeaderColor);
  stroke-width: 2px;
}

.${kmnClassName}.popupHeader .close:hover {
  background: var(--activeHoverColor);
  stroke: black;
  stroke-width: 3px;
}

.${kmnClassName}.popupPanel {
  position: absolute;
  display: block;
  left: var(--popupMargin);
  width: calc(100% - var(--popupMargin) * 2);
  top: calc(var(--popupMargin) + var(--popupHeaderHeight));
  height: calc(100% - (var(--popupHeaderHeight) + var(--popupMargin) * 2));
}
`

let currentPopup = null;

class PopUp {
  constructor() {
    this.panel = null;
    this.popArea = null;
    this.onHide = () => { };
  }

  /**
   * @template {PanelBase} T
   * @param {new(any) => T} classType - A generic parameter that flows through to the return type
   * @param {object} [options]
   * @return {T}
   */
  setPanel(classType, options) {
    this.panel = new classType(options);
    return this.panel;
  }

  initializeDOM() {
    addCSS('pop-up', cssStr);
    /** @type {HTMLDivElement} */ /* @ts-ignore: this is annoying */
    this.popArea = document.querySelector('.popupArea');
    if (!this.popArea) {
      this.popArea = createKMNElement('div');
      this.popArea.classList.add('popupArea');
      this.popArea.$setVisible(false);
      document.body.appendChild(this.popArea);
      // this.popArea.onmousedown = (evt) => {
      //   if (evt.target === this.popArea || this.panel.options.hollywood) {
      //     if (currentPopup) {
      //       currentPopup.hide();
      //     }
      //   }
      // }
    }
    if (this.panel.options.hollywood) {
      this.panel.initializeDOM(this.popArea);
    } else {
      this.parentPanel = this.popArea.$el({ cls: 'popupContent' });
      this.parentPanel.$setVisible(false);

      if (!isNaN(this.panel.preferredWidth)) {
        this.parentPanel.style.width = this.panel.preferredWidth + 'px';
      }
      if (this.panel.preferredHeight) {
        this.parentPanel.style.height = this.panel.preferredHeight + 'px';
      }

      this.header = this.parentPanel.$el({ cls: 'popupHeader' });
      this.title = this.header.$el({ cls: 'popupTitle' });
      this.addButton = this.header.$el({ cls: "close" });
      this.addButton.appendChild(svgIcon("M4,4L20,20M20,4L4,20", 30, 30));
      this.addButton.onclick = this.hide.bind(this);
      this.panelEl = this.parentPanel.$el({ cls: 'popupPanel' });

      this.parentPanel.addEventListener('click', (event) => event);
      this.panel.initializeDOM(this.panelEl);
      this.panel.onHide = () => {
        this.hide();
      }
    }
  }

  show(str) {
    currentPopup = this;

    if (this.title) {
      this.title.innerText = str;
    }
    if (this.popArea) {
      this.popArea.$setVisible(true);
    }
    if (this.parentPanel) {
      this.parentPanel.$setVisible(true);
    }
    this.panel.popUp = this;
    return this.panel.show();
  }

  hide() {
    currentPopup = null;
    this.panel.hide();
    if (this.parentPanel) {
      this.parentPanel.$setVisible(false);
    }
    if (this.popArea) {
      this.popArea.$setVisible(false);
    }
    this.onHide();
  }
}
/**
   * @param {typeof PanelBase} classType - A generic parameter that flows through to the return type
   * @param {object} [options]
   * @return {PopUp}
   */
PopUp.Create = function (classType, options) {
  let popup = new PopUp();
  // @ts-ignore: But it's decendand has the signature, luckely this isn't realy typescript
  popup.setPanel(classType, options);
  popup.initializeDOM();
  return popup;
}
export default PopUp;