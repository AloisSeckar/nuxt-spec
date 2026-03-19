// Element.checkVisibility() is not available in Vitest
global.Element.prototype.checkVisibility = function () {
  // in tests we always just assume the element is visible
  return true
}
