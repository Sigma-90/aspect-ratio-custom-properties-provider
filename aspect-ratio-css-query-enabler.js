// The following function is based on the debouncing function from John Hann, just renamed a bit to avoid potential conflicts in the global namespace:
// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
function generateDebouncer(fn, detectionBufferTime, callAtStart) {
  let timer;
  
  return function debouncer() {
	const ctx = this, args = arguments;
  
	const onDetectionExpiration = function() {
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
  }
}

function generateAspectRatioCustomPropertyRefresher(appRootRef) {
  return function () {
    const vhVal = window.innerHeight;
	  const vwVal = window.innerWidth;
    appRootRef.style.setProperty('--vh', (vhVal * 0.01) + 'px');
    appRootRef.style.setProperty('--vw', (vwVal * 0.01) + 'px');
    appRootRef.style.setProperty('--ar', (vwVal / vhVal) + '');
    appRootRef.style.setProperty('--sr', (Math.max(vwVal, vhVal) / Math.min(vwVal, vhVal)) + '');
  };
}

function initializeAspectRatioCssQueryEnabler(bGenerateSquareDetectionBaseStyling, fSquareDetectionToleranceWindow) {
  const refreshAspectRatioCustomPropertyCalculation = generateAspectRatioCustomPropertyRefresher(document.documentElement);
  const onResizeDebounced = generateDebouncer(refreshAspectRatioCustomPropertyCalculation, 25, false);
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
    const rootStyle = `:root { 
  --aspect-ratio: var(--ar, 1.0); 
  --tolerance: ${tolerance}; 
  --threshold: calc((var(--tolerance) + 1 - var(--aspect-ratio)) * 100000); 
  --clamp-query: calc(var(--threshold) * 1rem); 
}`;
	const styleBlock = document.createElement('style');
    styleBlock.type = 'text/css';

    if (styleBlock.styleSheet) {
      styleBlock.styleSheet.cssText = rootStyle;
    } else {
      styleBlock.appendChild(document.createTextNode(rootStyle));
    }
    document.getElementsByTagName('head')[0].appendChild(styleBlock);
  }
}
