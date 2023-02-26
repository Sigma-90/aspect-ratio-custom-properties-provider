function generateAspectRatioCssQueryDefinitions(fSquareDetectionToleranceWindow) {
  let tolerance = fSquareDetectionToleranceWindow;
  if (typeof fSquareDetectionToleranceWindow === 'undefined') {
    tolerance = 0.125;
  }
  if (tolerance > 0.999) {
    console.log('Invalid tolerance window. Make sure it is a decimal number smaller than 1.');
    return;
  }
  // Using a template string here messes with various JS minifiers, so we concatenate it the classic way.
  const rootStyle =
    "\n:root {\n" +
    "  --aspect-ratio: var(--ar, 1);\n" +
    "  --screen-ratio: var(--sr, 1);\n" +
    "  --net-aspect-ratio: var(--ar-net, 1);\n" +
    "  --net-screen-ratio: var(--sr-net, 1);\n" +
    "  --ratio-multiplier-min: var(--ratio-min-multiplier, 1rem);" +
    "  --ratio-multiplier-max: var(--ratio-max-multiplier, -1rem);" +
    "  --ratio-calculation-tolerance: " + tolerance + ";\n" +
    "  --aspect-ratio-threshold: calc((var(--ratio-calculation-tolerance) + 1 - var(--aspect-ratio)) * 100000);\n" +
    "  --screen-ratio-threshold: calc((var(--ratio-calculation-tolerance) + 1 - var(--screen-ratio)) * 100000);\n" +
    "  --net-aspect-ratio-threshold: calc((var(--ratio-calculation-tolerance) + 1 - var(--net-aspect-ratio)) * 100000);\n" +
    "  --net-screen-ratio-threshold: calc((var(--ratio-calculation-tolerance) + 1 - var(--net-screen-ratio)) * 100000);\n" +
    "  --clamp-query-select-max-when-full-viewport-is-squared: calc(var(--aspect-ratio-threshold) * var(--ratio-multiplier-max));\n" +
    "  --clamp-query-select-min-when-full-viewport-is-squared: calc(var(--aspect-ratio-threshold) * var(--ratio-multiplier-min));\n" +
    "  --clamp-query-select-max-when-full-viewport-is-portrait: calc(var(--screen-ratio-threshold) * var(--ratio-multiplier-max));\n" +
    "  --clamp-query-select-min-when-full-viewport-is-portrait: calc(var(--screen-ratio-threshold) * var(--ratio-multiplier-min));\n" +
    "  --clamp-query-select-min-when-full-viewport-is-landscape: var(--clamp-query-select-max-when-full-viewport-is-portrait);\n" +
    "  --clamp-query-select-max-when-full-viewport-is-landscape: var(--clamp-query-select-min-when-full-viewport-is-portrait);\n" +
    "  --clamp-query-select-max-when-viewport-content-is-squared: calc(var(--net-aspect-ratio-threshold) * var(--ratio-multiplier-max));\n" +
    "  --clamp-query-select-min-when-viewport-content-is-squared: calc(var(--net-aspect-ratio-threshold) * var(--ratio-multiplier-min));\n" +
    "  --clamp-query-select-max-when-viewport-content-is-portrait: calc(var(--net-screen-ratio-threshold) * var(--ratio-multiplier-max));\n" +
    "  --clamp-query-select-min-when-viewport-content-is-portrait: calc(var(--net-screen-ratio-threshold) * var(--ratio-multiplier-min));\n" +
    "  --clamp-query-select-min-when-viewport-content-is-landscape: var(--clamp-query-select-max-when-viewport-content-is-portrait);\n" +
    "  --clamp-query-select-max-when-viewport-content-is-landscape: var(--clamp-query-select-min-when-viewport-content-is-portrait);\n" +
    "  --scrollbar-width: var(--sb-wd, 0px);\n" +
    "  --scrollbar-height: var(--sb-ht, 0px);\n" +
    "  --scrollbar-width: var(--sb-wd, 0px);\n" +
    "}\n";
  const styleBlock = document.createElement('style');
  styleBlock.setAttribute('type', 'text/css');

  if (styleBlock.styleSheet) {
    styleBlock.styleSheet.cssText = rootStyle;
  } else {
    styleBlock.appendChild(document.createTextNode(rootStyle));
  }
  document.getElementsByTagName('head')[0].appendChild(styleBlock);
}
