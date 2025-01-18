// Element.checkVisibility() is not available in Vitest
global.Element.prototype.checkVisibility = function () {
  // in tests we allways just assume the element is visible
  return true
}
