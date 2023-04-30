class resizer
{
    conf = {
        gap       : 7,
        toCorner  : 10,
        width     : 1024,
        minWidth  : 1200,
        maxWidth  : 1300,
        height    : 576,
        minHeight : 576,
        maxHeight : 576,
        x         : null,
        y         : null,
        // center    : true,
        // direction : 'all', //
        parent    : undefined, // The parent element's CSS Selector
        child     : undefined, // The chil element's CSS Selector
        // expandOnly: false,
        // shrinkOnly: false,
        // keepAspectRatio    : false,
        // rememberLastDisplay: true
    }

    handleEvent = event => this[ event.type ]( event )

    constructor( options )
    {
        Object.keys( this.conf )
        .forEach( key =>
        {
            this.conf[ key ] = options?.[ key ] ?? this.conf[ key ]
        })

        if( !this.conf.parent || !this.conf.child )
        {
            throw new Error( 'Resizer couldn\'t initialized. ' )
        }

        let style = `
            ${ this.conf.parent }
            {
                touch-action: none;
                width: ${ this.conf.width }px;
                height: ${ this.conf.height }px;
                padding: ${ this.conf.gap }px;
                position: absolute;
                overflow: hidden;
                background: blue;
                min-width: ${ this.conf.minWidth }px;
                max-width: ${ this.conf.maxWidth }px;
                min-height: ${ this.conf.minHeight }px;
                max-height: ${ this.conf.maxHeight }px;
            }
        `
        this.conf.style = new CSSStyleSheet()
        this.conf.style.replaceSync( style )

        window.st = this.conf.style

        document.adoptedStyleSheets = [
            ...document.adoptedStyleSheets, this.conf.style
        ];

        [ 'parent', 'child' ]
        .forEach( key =>
        {
            this.conf[ key ] = document.querySelector( this.conf[ key ] )
            this.conf[ key ].addEventListener( 'pointerenter', this )
            this.conf[ key ].addEventListener( 'pointerleave', this )
        })

        this.conf.toCorner += this.conf.gap

        this.conf.cursors = [
            'nwse-resize',
            'nesw-resize',
            'ns-resize',
            'ew-resize'
        ];
    }

    pointerdown( event ) 
    {
        event.preventDefault()
        event.stopPropagation()

        if( event.isPrimary )
        {            
            if( this.conf.parent.hasPointerCapture( event.pointerId ) )
            {
                //touch
                this.conf.parent.releasePointerCapture( event.pointerId )
                this.pointermove( event )
            }

            this.conf.parent.setPointerCapture( event.pointerId )
            this.conf.parent.addEventListener( 'pointerup', this, { once: true } )
            //resizeObserver.observe(document.documentElement);
            //electron.ipcRenderer.send( 'setBounds', {pointerdown: true} )

            let l = screen.availWidth - screenLeft - outerWidth + screen.availLeft
            let h = screen.availHeight - screenTop - outerHeight + screen.availTop
        }
    }

    pointerup( event ) 
    {
        event.preventDefault()
        event.stopPropagation()

        if( event.isPrimary )
        {
            let top      = this.conf.parent.offsetTop
            let left     = this.conf.parent.offsetLeft
            let width    = this.conf.parent.offsetWidth
            let height   = this.conf.parent.offsetHeight
            let right    = width  + left
            let bottom   = height + top

            let pageX = Math.floor( event.pageX )
            let pageY = Math.floor( event.pageY )

            let x = screen.availWidth  - ( Math.floor( event.pageX ) + this.conf.distance[0] + screenLeft + screen.availLeft )
            let y = screen.availHeight - ( Math.floor( event.pageY ) + this.conf.distance[1] + screenTop  - screen.availTop  )

            this.conf.parent.releasePointerCapture( event.pointerId )
            this.conf.pointerId = undefined
        }
    }

    pointerenter( event ) 
    {
        event.preventDefault()
        event.stopPropagation()

        if( event.isPrimary && !this.conf.parent.hasPointerCapture( event.pointerId ) )
        {
            if( event.target === this.conf.parent )
            {
                this.conf.parent.addEventListener( 'pointerdown', this )
                this.conf.parent.addEventListener( 'pointermove', this )
            }
            else
            {
                this.conf.style.cssRules[0].style.cursor = 'auto'
                this.conf.parent.removeEventListener( 'pointerdown', this )
                this.conf.parent.removeEventListener( 'pointermove', this )
            }
        }
    }

    pointerleave( event )
    {
        event.preventDefault()
        event.stopPropagation()

        if( event.isPrimary && !this.conf.parent.hasPointerCapture( event.pointerId ) )
        {
            if( event.target === this.conf.parent )
            {
                this.conf.parent.removeEventListener( 'pointerdown', this )
                this.conf.parent.removeEventListener( 'pointermove', this )
            }
            else
            {
                this.conf.style.cssRules[0].style.cursor = 'auto'
                this.conf.parent.addEventListener( 'pointerdown', this )
                this.conf.parent.addEventListener( 'pointermove', this )
            }
        }
    }

    pointermove( events )
    {
        events.preventDefault()
        events.stopPropagation()

        if( events.isPrimary )
        {
            for( let event of events.getCoalescedEvents() )
            {
                let x        = Math.floor( event.pageX )
                let y        = Math.floor( event.pageY )
                let top      = this.conf.parent.offsetTop
                let left     = this.conf.parent.offsetLeft
                let width    = this.conf.parent.offsetWidth
                let height   = this.conf.parent.offsetHeight
                let right    = width  + left
                let bottom   = height + top
                let cursor

                if( !this.conf.parent.hasPointerCapture( event.pointerId ) )
                {
                    if( y >= top && x >= left && y <= top + this.conf.gap && x <= width + left + this.conf.gap )
                    {
                        //topLeft
                        if( x >= left && x <= left + this.conf.toCorner )
                        {
                            cursor = this.conf.cursors[0]
                            this.conf.hover = 1
                            this.conf.distance  = [ x - left, y - top ]
                        }
                        //topRight
                        else if( x <= width + left + this.conf.gap && x >= width + left - this.conf.toCorner )
                        {
                            cursor = this.conf.cursors[1]
                            this.conf.hover = 3
                            this.conf.distance  = [ right - x, y - top ]
                        }
                        //top
                        else
                        {
                            cursor = this.conf.cursors[2]
                            this.conf.hover = 2
                            this.conf.distance = [ 0, y - top ]
                        }
                    }
                    else if( y <= height + top && y >= height + top - this.conf.gap && x >= left - this.conf.gap && x <= width + left + this.conf.gap )
                    {
                        //bottomLeft
                        if( x >= left - this.conf.gap && x <= left + this.conf.toCorner )
                        {
                            cursor = this.conf.cursors[1]
                            this.conf.hover = 7
                            this.conf.distance  = [ x - left, bottom - y ]
                        }
                        //bottomRight
                        else if( x <= width + left + this.conf.gap && x >= width + left - this.conf.toCorner )
                        {
                            cursor = this.conf.cursors[0]
                            this.conf.hover = 5
                            this.conf.distance  = [ right - x, bottom - y ]
                        }
                        //bottom
                        else
                        {
                            cursor = this.conf.cursors[2]
                            this.conf.hover = 6
                            this.conf.distance  = [ 0, bottom - y ]
                        }
                    }
                    else if( x <= left + this.conf.gap && x >= left && y >= top - this.conf.gap && y <= height + top + this.conf.gap )
                    {
                        //leftTop
                        if( y >= top - this.conf.gap && y <= top + this.conf.toCorner )
                        {
                            cursor = this.conf.cursors[0]
                            this.conf.hover = 1
                            this.conf.distance  = [ x - left, y - top ]
                        }
                        //leftBottom
                        else if( y <= height + top + this.conf.gap && y >= height + top - this.conf.toCorner )
                        {
                            cursor = this.conf.cursors[1]
                            this.conf.hover = 7
                            this.conf.distance  = [ x - left, bottom - y ]
                        }
                        //left
                        else
                        {
                            cursor = this.conf.cursors[3]
                            this.conf.hover = 8
                            this.conf.distance  = [ x - left, y - top ]
                        }
                    }
                    else if( x >= width + left - this.conf.gap && x <= width + left && y >= top - this.conf.gap && y <= height + top + this.conf.gap )
                    {
                        //rightTop
                        if( y >= top - this.conf.gap && y <= top + this.conf.toCorner )
                        {
                            cursor = this.conf.cursors[1]
                            this.conf.hover = 3
                            this.conf.distance  = [ right - x, y - top ]
                        }
                        //rightBottom
                        else if( y <= height + top + this.conf.gap && y >= height + top - this.conf.toCorner )
                        {
                            cursor = this.conf.cursors[0]
                            this.conf.hover = 5
                            this.conf.distance  = [ right - x, bottom - y ]
                        }
                        //right
                        else
                        {
                            cursor = this.conf.cursors[3]
                            this.conf.hover = 4
                            this.conf.distance  = [ right - x, 0 ]
                        }
                    }
                    else
                    {
                        this.conf.hover = 0
                        cursor = 'auto'
                    }

                    this.conf.style.cssRules[0].style.cursor = cursor
                }
                else
                {
                    console.log(width + ' => ' +this.conf.maxWidth)

                    switch( this.conf.hover )
                    {
                        case 0:
                            this.conf.distance  = [ 0, 0 ]
                            break
                        case 1:
                            bottom = height + top
                            top    = y - this.conf.distance[1]
                            left   = x - this.conf.distance[0]
                            height = bottom - top
                            width  = right  - left
                            this.conf.style.cssRules[0].style.top    = top    + 'px'
                            this.conf.style.cssRules[0].style.left   = left   + 'px'
                            this.conf.style.cssRules[0].style.height = height + 'px'
                            this.conf.style.cssRules[0].style.width  = width  + 'px'
                            break
                        case 2:
                            //Top
                            bottom = height + top
                            top    = y - this.conf.distance[1]
                            height = bottom - top
                            this.conf.style.cssRules[0].style.top    = top    + 'px'
                            this.conf.style.cssRules[0].style.height = height + 'px'
                            break
                        case 3:
                            bottom = height + top
                            top    = y - this.conf.distance[1]
                            right  = x + this.conf.distance[0]
                            height = bottom - top
                            width  = right  - left
                            this.conf.style.cssRules[0].style.left   = left   + 'px'
                            this.conf.style.cssRules[0].style.top    = top    + 'px'
                            this.conf.style.cssRules[0].style.right  = right  + 'px'
                            this.conf.style.cssRules[0].style.height = height + 'px'
                            this.conf.style.cssRules[0].style.width  = width  + 'px'
                            break
                        case 4:
                            //Right
                            right  = x + this.conf.distance[0]
                            width  = right - left
                            width  = width >= this.conf.maxWidth ? this.conf.maxWidth : width
                            this.conf.style.cssRules[0].style.left   = left   + 'px'
                            this.conf.style.cssRules[0].style.width  = width  + 'px'
                            break
                        case 5:
                            bottom = y + this.conf.distance[1]
                            right  = x + this.conf.distance[0]
                            height = bottom - top
                            width  = right  - left
                            this.conf.style.cssRules[0].style.left   = left   + 'px'
                            this.conf.style.cssRules[0].style.right  = right  + 'px'
                            this.conf.style.cssRules[0].style.height = height + 'px'
                            this.conf.style.cssRules[0].style.width  = width  + 'px'
                            break
                        case 6:
                            bottom = y + this.conf.distance[1]
                            height = bottom - top
                            this.conf.style.cssRules[0].style.top    = top    + 'px'
                            this.conf.style.cssRules[0].style.bottom = bottom + 'px'
                            this.conf.style.cssRules[0].style.height = height + 'px'
                            break
                        case 7:
                            bottom = y + this.conf.distance[1]
                            left   = x - this.conf.distance[0]
                            height = bottom - top
                            width  = right  - left
                            this.conf.style.cssRules[0].style.left   = left   + 'px'
                            this.conf.style.cssRules[0].style.right  = right  + 'px'
                            this.conf.style.cssRules[0].style.height = height + 'px'
                            this.conf.style.cssRules[0].style.width  = width  + 'px'
                            break
                        case 8:
                            //Left
                            left   = x - this.conf.distance[0]
                            width  = right - left
                            width  = width >= this.conf.maxWidth ? this.conf.maxWidth : width
                            left   = width >= this.conf.maxWidth ? right - width : left
                            this.conf.style.cssRules[0].style.left   = left   + 'px'
                            this.conf.style.cssRules[0].style.width  = width  + 'px'
                            break
                    }
                }
            }
        }
    }
}

export { resizer, resizer as default }