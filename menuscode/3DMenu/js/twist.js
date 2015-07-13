function scrollY() {
    return window.pageYOffset || docElem.scrollTop;
}

var docElem = window.document.documentElement, 
    support = "transition",
    transEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd',
        'transition': 'transitionend'
    },
    transEndEventName = transEndEventNames[ 'transition' ],
    docscroll = 0;
    
function init() {
    var showMenu = document.getElementById( 'showMenu' ),
        twistWrapper = document.getElementById( 'twist' ),
        container = twistWrapper.querySelector( '.container' ),
        contentWrapper = container.querySelector( '.wrapper' );

    showMenu.addEventListener( 'click', function( ev ) {
        ev.stopPropagation();
        ev.preventDefault();
        docscroll = scrollY();
        // change top of contentWrapper
        contentWrapper.style.top = docscroll * -1 + 'px';
        // mac chrome issue:
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        // add modalview class
        classie.add( twistWrapper, 'open' );
        // animate..
        setTimeout( function() { classie.add( twistWrapper, 'animate' ); }, 25 );
    });
    
    container.addEventListener( 'click', function( ev ) {
        if( classie.has( twistWrapper, 'animate') ) {
            var onEndTransFn = function( ev ) {
                if( support && ( ev.target.className !== 'container' || ev.propertyName.indexOf( 'transform' ) == -1 ) ) return;
                this.removeEventListener( transEndEventName, onEndTransFn );
                classie.remove( twistWrapper, 'open' );
                document.body.scrollTop = document.documentElement.scrollTop = docscroll;
                contentWrapper.style.top = '0px';
            };
                twistWrapper.addEventListener( transEndEventName, onEndTransFn );
            classie.remove( twistWrapper, 'animate' );
        }
    });
    
    twistWrapper.addEventListener( 'click', function( ev ) { return false; } );
}
init();