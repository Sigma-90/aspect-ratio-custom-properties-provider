// The following function is based on the debouncing function from John Hann, just renamed a bit to avoid potential conflicts in the global namespace:
// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
function generateDebouncer(fn, detectionBufferTime, callAtStart) {
  let timer;

  return function debouncer() {
    const ctx = this,
      args = arguments;

    const onDetectionExpiration = function () {
      if (!callAtStart) {
        fn.apply(ctx, args);
      }
      timer = null;
    };

    if (timer) {
      clearTimeout(timer);
    } else if (callAtStart) {
      fn.apply(ctx, args);
    }

    timer = setTimeout(onDetectionExpiration, detectionBufferTime || 80);
  };
}

function generateAspectRatioCustomPropertyRefresher(appRootRef) {
  return function () {
    const vhVal = window.innerHeight;
    const vwVal = window.innerWidth;
    appRootRef.style.setProperty('--vh', vhVal * 0.01 + 'px');
    appRootRef.style.setProperty('--vw', vwVal * 0.01 + 'px');
    appRootRef.style.setProperty('--sr', vwVal / vhVal + '');
    appRootRef.style.setProperty('--ar',Math.max(vwVal, vhVal) / Math.min(vwVal, vhVal) + '');
  };
}

function initializeAspectRatioCssQueryEnabler(
  iDebouncingDetectionBufferTimeMs,
  bGenerateSquareDetectionBaseStyling,
  fSquareDetectionToleranceWindow
) {
  const refreshAspectRatioCustomPropertyCalculation =
    generateAspectRatioCustomPropertyRefresher(document.documentElement);
  const onResizeDebounced = generateDebouncer(
    refreshAspectRatioCustomPropertyCalculation,
    iDebouncingDetectionBufferTimeMs || 25,
    false
  );
  refreshAspectRatioCustomPropertyCalculation();
  window.addEventListener('resize', onResizeDebounced);
  window.addEventListener('orientationChanged', onResizeDebounced);

  if (bGenerateSquareDetectionBaseStyling) {
    let tolerance = fSquareDetectionToleranceWindow;
    if (typeof fSquareDetectionToleranceWindow === 'undefined') {
      tolerance = 0.125;
    }
    if (tolerance > 0.999) {
      console.log('Invalid tolerance window. Make sure it is a decimal number smaller than 1.');
      return;
    }
    // Using a template string here messes with some minifiers, so we concatenate it the classic way.
    const rootStyle =
      ":root {\n  --aspect-ratio: var(--ar, 1);\n  --screen-ratio: var(--sr, 1);\n  --tolerance: " +
      tolerance +
      ";\n  --aspect-ratio-threshold: calc((var(--tolerance) + 1 - var(--aspect-ratio)) * 100000);\n  --screen-ratio-threshold: calc((var(--tolerance) + 1 - var(--screen-ratio)) * 100000);\n" +
      "  --clamp-query-select-max-when-squared: calc(var(--aspect-ratio-threshold) * 1rem);\n  --clamp-query-select-min-when-squared: calc(var(--aspect-ratio-threshold) * -1rem);\n" +
      "  --clamp-query-select-max-when-portrait: calc(var(--screen-ratio-threshold) * 1rem);\n  --clamp-query-select-min-when-portrait: calc(var(--screen-ratio-threshold) * -1rem);\n" +
      "  --clamp-query-select-min-when-landscape: var(--clamp-query-select-max-when-portrait);\n  --clamp-query-select-max-when-landscape: var(--clamp-query-select-min-when-portrait);\n}";
    const styleBlock = document.createElement('style');
    styleBlock.setAttribute('type', 'text/css');

    if (styleBlock.styleSheet) {
      styleBlock.styleSheet.cssText = rootStyle;
    } else {
      styleBlock.appendChild(document.createTextNode(rootStyle));
    }
    document.getElementsByTagName('head')[0].appendChild(styleBlock);
  }
}
