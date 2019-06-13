import {
  once,
  addStylesToHead as _addStylesToHead,
  getScrollBarSize as _getScrollBarSize,
  normalizeEvent
} from './utils.js';

const addStylesToHead = once(_addStylesToHead);
const getScrollBarSize = once(_getScrollBarSize);

export default class CustomScroll {
  static get innerTemplate() {
    return `
      <div class="scroll__viewport">
        <div class="scroll__content">
        </div>
      </div>
      <div class="scroll__bar scroll__bar_v">
        <div class="scroll__track scroll__track_v">
          <div class="scroll__drag scroll__drag_v"></div>
        </div>
      </div>
      <div class="scroll__bar scroll__bar_h">
        <div class="scroll__track scroll__track_h">
          <div class="scroll__drag scroll__drag_h"></div>
        </div>
      </div>
    `;
  }

  constructor(element, options) {
    const self = this;

    self._options = options || {}
    self._state = {};

    const fragment = document.createDocumentFragment();
    while (element.childNodes.length > 0) {
      fragment.appendChild(element.childNodes[0]);
    };
    element.innerHTML = CustomScroll.innerTemplate;
    element.classList.add('scroll');

    self._refs = {
      rootElement: element,
      viewport: element.querySelector('.scroll__viewport'),
      content: element.querySelector('.scroll__content'),
      scrollBarV: element.querySelector('.scroll__bar_v'),
      scrollBarH: element.querySelector('.scroll__bar_h'),
      trackV: element.querySelector('.scroll__track_v'),
      trackH: element.querySelector('.scroll__track_h'),
      dragV: element.querySelector('.scroll__drag_v'),
      dragH: element.querySelector('.scroll__drag_h')
    };

    self._refs.content.appendChild(fragment);

    const scrollBarSize = getScrollBarSize();
    addStylesToHead(`
      .scroll__content {
        margin-right: ${-scrollBarSize}px;
        margin-bottom: ${-scrollBarSize}px;
      }`
    );

    [
      'onContentScroll',
      'onStartV',
      'onStartH',
      'onEnd',
      'onPointerMove',
      'update'
    ].forEach(function(method) {
      self[method] = self[method].bind(self);
    });

    self._refs.content.addEventListener('scroll', this.onContentScroll);
    self._refs.dragV.addEventListener('mousedown', this.onStartV);
    self._refs.dragH.addEventListener('mousedown', this.onStartH);
    self._refs.dragV.addEventListener('touchstart', this.onStartV);
    self._refs.dragH.addEventListener('touchstart', this.onStartH);
    document.addEventListener('mouseleave', this.onEnd);
    document.addEventListener('touchend', this.onEnd);
    document.addEventListener('touchcancel', this.onEnd);
    self.update();

    if (self._options.afterInit) {
      self._options.afterInit(self, self._refs);
    }
  }

  update() {
    const {
      rootElement,
      content,
      trackV,
      trackH,
      dragV,
      dragH
    } = this._refs;

    const overflowV = content.scrollHeight > content.clientHeight;
    const factorV = content.clientHeight / content.scrollHeight;
    dragV.style.height = (factorV * trackV.offsetHeight).toFixed(2) + 'px';
    const actionV = overflowV ? 'add' : 'remove';
    rootElement.classList[actionV]('scroll_overflow_v');

    const overflowH = content.scrollWidth > content.clientWidth;
    const factorH = content.clientWidth / content.scrollWidth;
    dragH.style.width = (factorH * trackH.offsetWidth).toFixed(2) + 'px';
    const actionH = overflowH ? 'add' : 'remove';
    rootElement.classList[actionH]('scroll_overflow_h');

    this._state.vCoef = (trackV.offsetHeight - dragV.offsetHeight) / (content.scrollHeight - content.clientHeight);
    this._state.hCoef = (trackH.offsetWidth - dragH.offsetWidth) / (content.scrollWidth - content.clientWidth);
  }

  onContentScroll() {
    const { vCoef, hCoef } = this._state;
    const { content, dragV, dragH } = this._refs;
    const { scrollLeft, scrollTop } = content;
    dragV.style.transform = `translateY(${vCoef * scrollTop}px)`;
    dragH.style.transform = `translateX(${hCoef * scrollLeft}px)`;
  }

  onStartV(event) {
    this._state.dragMode = 'v';
    this._state.startV = normalizeEvent(event).clientY;
    document.addEventListener('mousemove', this.onPointerMove);
    document.addEventListener('mouseup', this.onEnd);
    document.addEventListener('touchmove', this.onPointerMove);
    document.addEventListener('touchend', this.onEnd);
    document.addEventListener('touchcancel', this.onEnd);
    event.preventDefault();
  }

  onStartH(event) {
    this._state.dragMode = 'h';
    this._state.startH = normalizeEvent(event).clientX;
    document.addEventListener('mousemove', this.onPointerMove);
    document.addEventListener('mouseup', this.onEnd);
    document.addEventListener('touchmove', this.onPointerMove);
    document.addEventListener('touchend', this.onEnd);
    document.addEventListener('touchcancel', this.onEnd);
    event.preventDefault();
  }

  onEnd(event) {
    document.removeEventListener('mousemove', this.onPointerMove);
    document.removeEventListener('mouseup', this.onEnd);
    document.removeEventListener('touchmove', this.onPointerMove);
    document.removeEventListener('touchend', this.onEnd);
    document.removeEventListener('touchcancel', this.onEnd);
    this._state.dragMode = null;
  }

  onPointerMove(event) {
    const norm_event = normalizeEvent(event);
    const { vCoef, hCoef, dragMode } = this._state;
    const { content } = this._refs;

    const v = norm_event.deltaY && norm_event.deltaY * norm_event.deltaFactor || norm_event.clientY;
    const h = norm_event.deltaX && norm_event.deltaX * norm_event.deltaFactor || norm_event.clientX;
    const diffV = v - this._state.startV;
    const diffH = h - this._state.startH;

    this._state.startV += diffV;
    this._state.startH += diffH;

    switch (dragMode) {
      case 'v':
        content.scrollTop += diffV / vCoef;
        break;
      case 'h':
        content.scrollLeft += diffH / hCoef;
        break;
    }
  }
}