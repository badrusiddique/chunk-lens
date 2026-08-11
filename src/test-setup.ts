import '@testing-library/jest-dom';

// Radix UI Slider requires ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Radix UI Select requires pointer capture APIs
window.HTMLElement.prototype.hasPointerCapture = () => false;
window.HTMLElement.prototype.setPointerCapture = () => {};
window.HTMLElement.prototype.releasePointerCapture = () => {};

// Radix UI Select scrolls the selected item into view on open
window.HTMLElement.prototype.scrollIntoView = () => {};
