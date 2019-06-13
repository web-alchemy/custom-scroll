export function once(fn) {
  let isCalled;
  let result;

  return function() {
    if (!isCalled) {
      result = fn.apply(this, arguments);
      isCalled = true;
    }
    return result;
  }
}

export function getScrollBarSize() {
  const el = document.createElement('div');
  el.style.cssText = [
    'pointer-events: none !important',
    'position: fixed !important',
    'z-index: -9999 !important',
    'top: 0 !important',
    'left: 0 !important',
    'width: 99px !important',
    'height: 99px !important',
    'padding: 0 !important',
    'border: 0 !important',
    'overflow: scroll !important',
    '-ms-overflow-style; scrollbar !important'
  ].join(';');
  document.body.appendChild(el);
  const value = el.offsetWidth - el.clientWidth;
  document.body.removeChild(el);
  return value;
}

export function addStylesToHead(cssText) {
  const style = document.createElement('style');
  style.textContent = cssText;
  document.head.appendChild(style);
}

export function normalizeEvent(event) {
  return (event.touches && event.touches[0]) || event;
}