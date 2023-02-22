# Aspect Ratio CSS Query Enabler

A helper script that will enhance the browser's CSS styling capabilities by providing JS-calculated custom properties which allow for the creation of calc and clamp CSS functions that would otherwise not be possible with the way CSS currently works.

Copyright 2022 Stefan Winkler, <https://github.com/Sigma-90> - The MIT License provided in the same folder as this README file applies.
  
## JS Usage

Reference this script in your document head to ensure that it loads as soon as possible. Even better would be to output its contents inside a script tag so nothing has to be loaded in the first place.
  
Then, either in another JS file that is located as close as possible after the one with this script, or - again, preferably - inside a script block (in case you went with the recommendation of using a script block with content for the main script it should be the same one), call the initialization function "initializeAspectRatioCssQueryEnabler".
  
The reason this has to be called as soon as possible is to optimize the chances of the script being executed before the domReady event fires, to prevent layout shifts. These can happen when loaded CSS rules are rendering things initially incorrect, because the CSS custom properties used in the style definitions have not been generated yet.
  
### Init Params  
  
The initialization function can take two optional parameters:
  
* **bGenerateSquareDetectionBaseStyling**:

  If true, the function will generate a style element inside the current document head that contains basic custom property definitions needed for being able to write CSS clamp queries. You will find more infos on these in the CSS chapter of this file.

  If you are planning to add such a definition to your main CSS file instead - which is highly recommended by the way, unless different tolerance values are required for different pages - you can just leave this out and call the initialization function without any parameters.

* **fSquareDetectionToleranceWindow**:

  Only applies if *bGenerateSquareDetectionBaseStyling* has been provided with a truthy value. This will define the tolerance value of the generated CSS calculation. Expected is a floating point number between 0 and 1.

  This controls how close the aspect ratio can get to a perfect square before the threshold calculation result flips from a negative to a positive value and vice versa.

  If nothing is provided here, a default value 0f 0.125 is applied, which was established as a good best-practice value through various experiments.

### Output / Core Functionality

When initialized, the script will fill the style attribute of the root &lt;html&gt; tag with four custom property definitions and update them every time the viewport size changes. These are:
  
* **--vh**:
  A multiplier for CSS calc functions, the value will always represent 1% of the current viewport height, but in pixels, which can be very helpful in certain cases.
  
* **--vw**:
  Same as above, but for the viewport width instead of the height.

* **--ar**:
  The current viewport aspect ratio in the traditional definition of width by height, so it will be 1 for perfect squares, smaller for viewports in portrait view and larger for viewports in landscape view.
  
* **--sr**:
  The current viewport screen ratio, independent from portrait or landscape mode, as the larger value will always be divided by the smaller one, so the nemric result will never be smaller than 1. Can be quite useful for certain use cases, so we calculate it here as well.

  One practical example: calc((var(--sr) - 0.0001 - var(--ar)) * 100000) will result in a large negative value when the screen is in landscape mode and a large positive one when in portrait mode, which can be used with a clamp function to apply one of two CSS values based on the current viewport orientation.

## CSS Usage

  While the generated values listed above are by themselves already very useful, because they are exposing values usable in CSS calc functions that would otherwise be unobtainable, the main use case intended is to detect the current viewport aspect ratio (hence the name) and to enable that, the script is capable of generating the necessary CSS ruleset definition for this if need be.
  
  However, it is recommended to include that definition in your website's main CSS file instead, unless different tolerance values are required for different pages (special treatment for landing pages, for example).
  
  It would have to look like this then:
  
  ```css
    :root { 
       --aspect-ratio: var(--ar, 1.0); 
       --tolerance: 0.125; 
       --threshold: calc((var(--tolerance) + 1 - var(--aspect-ratio)) * 100000); 
       --clamp-query: calc(var(--threshold) * 1rem);
    }
  ```
  
  of course it can also be shortened a bit, if the results of each intermediary calculation step are not needed for other purposes, like so:
  
  ```css
    :root { 
       --clamp-query: calc(calc((1.125 - var(--ar, 1.0)) * 100000) * 1rem);
    }
  ```
  
  This should be placed very high up in the cascade, preferably right after any @-rules like imports and font definitions.
  
  The --clamp-query custom property can then be used like in this example:
  
  ```css
    .some-class {
        font-size: clamp(min(8vh,2vw), var(--clamp-query), 2rem); 
    }
  ```

  What this will do is the following:
  
  When the viewport aspect ratio is almost squared (within the defined tolerance), --clamp-query will become a large positive number and thus the third argument of the clamp function (the allowed maximum) will be used, otherwise --clamp-query will be a very large negative number and thus the first argument (the allowed minimum) is applied.
  
  This basically turns the clamp function into an inline media query for the screen aspect ratio, something that is not possible with regular CSS.
  
  You can learn more about clamp pseudo queries in these brilliant articles:

  Smashing Magazine: <https://www.smashingmagazine.com/2022/08/fluid-sizing-multiple-media-queries/>

  CSS Tricks: <https://css-tricks.com/linearly-scale-font-size-with-css-clamp-based-on-the-viewport/>
