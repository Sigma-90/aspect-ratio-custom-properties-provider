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
    const chVal = document.body && document.body.clientHeight || 0;
    const cwVal = document.body && document.body.clientWidth || 0;
    const sBarH = vhVal - chVal;
    const sBarW = vwVal - cwVal;
    appRootRef.style.setProperty('--ratio-min-multiplier', '-1rem');
    appRootRef.style.setProperty('--ratio-max-multiplier', '1rem');
    appRootRef.style.setProperty('--vh', vhVal * 0.01 + 'px');
    appRootRef.style.setProperty('--vw', vwVal * 0.01 + 'px');
    appRootRef.style.setProperty('--vh-net', chVal * 0.01 + 'px');
    appRootRef.style.setProperty('--vw-net', cwVal * 0.01 + 'px');
    appRootRef.style.setProperty('--sr', vwVal / vhVal + '');
    appRootRef.style.setProperty('--ar',Math.max(vwVal, vhVal) / Math.min(vwVal, vhVal) + '');
    appRootRef.style.setProperty('--sr-net', cwVal / chVal + '');
    appRootRef.style.setProperty('--ar-net', Math.max(cwVal, chVal) / Math.min(cwVal, chVal) + '');
    appRootRef.style.setProperty('--sb-wd', sBarW + 'px');
    appRootRef.style.setProperty('--sb-ht', sBarH + 'px');

    const pageIsNotSupposedToScrollVertically = document.body && document.body.classList.contains('no-v-scroll');
    const pageIsSupposedToScrollHorizontally = document.body && document.body.classList.contains('has-h-scroll');
    // In case some of the calculated values are 0, we take this as an indicator that the initialization function might have been executed too early (usually before the DOM was ready) to determine the correct values, so we return false here in that case so the initialization function can use that information to trigger a recalculation.
    // Note that a vertical scrollbar width is expected here by default while for the horizontal scrollbar height its absence is expected, because of statistics: Most pages will never show a horizontal scrollbar anyway, so it being present is an exception to the rule, while finding no vertical one might very well be an indicator that something went wrong, as most pages contain more content that what fits on a single screen. But with two control classes on the body tag a UI designer can define their intent more clearly so that the validation matches the expectation and thus reduce the risk of running a redundant recalculation. The downside to this is that mobile devices and browsers that use conditionally displayed overlay scrollbars will all toggle this recalculation every time even when it is specified with control classes that a scrollbar is expected, but in these cases it was determined to better be safe than sorry.
    return vhVal > 0 && vwVal > 0 && chVal > 0 && cwVal > 0 && (pageIsNotSupposedToScrollVertically || sBarW > 0) && (!pageIsSupposedToScrollHorizontally || sBarH > 0);
  };
}

window.autoInitAspectRatioQueries = document.body && document.body.classList.contains('auto-init-aspect-ratio-c-props-provider');

function initializeAspectRatioCustomPropertiesProvider(
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
  const pageReady = refreshAspectRatioCustomPropertyCalculation();
  const setReadyMsg = function(){
    if (window.autoInitAspectRatioQueries) {
      document.body.classList.remove('auto-init-aspect-ratio-c-props-provider');
    }
    document.body.classList.add('aspect-ratio-c-props-available');
  };

  // Simplified DOM ready check
  if (!/in/.test(document.readyState)) {
    // DOM is ready
    setReadyMsg();
    // If we have reason to assume that not everything might have been ready from the start, we trigger a recalculation that happens after a few milliseconds to ensure that we end up with valid values from the beginning.
    if (!pageReady) {
      setTimeout(refreshAspectRatioCustomPropertyCalculation, 250);
    }
  } else {
    document.addEventListener('DOMContentLoaded', function(){
      setReadyMsg();
      if (!pageReady) {
        refreshAspectRatioCustomPropertyCalculation();
      }
    });
  }

  window.addEventListener('resize', onResizeDebounced);
  window.addEventListener('orientationChanged', onResizeDebounced);

  if (bGenerateSquareDetectionBaseStyling) {
    if (typeof generateAspectRatioCustomPropertyDefinitions === 'function') {
      generateAspectRatioCustomPropertyDefinitions(fSquareDetectionToleranceWindow);
    } else {
      console && console.error && console.error('CSS aspect ratio definition generation script not loaded, aborting.');
    }
  }
}

if (window.autoInitAspectRatioQueries) {
  const detectionBufferTime = document.body.hasAttribute('data-aspect-ratio-event-detection-buffer-time') ? Number(document.body.getAttribute('data-aspect-ratio-event-detection-buffer-time')) : 25;
  const squareDetectionToleranceWindow = document.body.hasAttribute('data-aspect-ratio-square-detection-tolerance') ? parseFloat(document.body.getAttribute('data-aspect-ratio-square-detection-tolerance')) : null;
  if (typeof squareDetectionToleranceWindow === 'number') {
    initializeAspectRatioCustomPropertiesProvider(detectionBufferTime, true, squareDetectionToleranceWindow);
  } else {
    initializeAspectRatioCustomPropertiesProvider(detectionBufferTime);
  }
}
