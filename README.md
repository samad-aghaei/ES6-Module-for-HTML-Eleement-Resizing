# A Touch Friendly ES6 Module for HTML Eleement Resizing
Optimized and smooth HTML element resizer module supports all the edges and the corners.

```javascript
import resizer from './src/script.js'

new resizer({
    width:     1024, // initial Width
    // minWidth:  1024, 
    // maxWidth:  1200,
    height:    576, // initial Height
    // minHeight: 576,
    // maxHeight: 600,
    parent:    'div', // The element to be resized
    child:     'span' // We need a full With/Height child element insde the parent
})
 ```
[DEMO](https://samad-aghaei.github.io/ES6-Module-for-HTML-Eleement-Resizing-Touch-Friendly/)
