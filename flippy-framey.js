function flippyFramey(opt){
    // make sure configuration options were passed, or use documented defaults
    opt=opt||{};

    /* 
        this object will be returned by this initiatialization function
        such that the user will be able to check up on state
        and make changes to the function's behaviour at runtime
    */
    var flipper={
        // event hooks
        on:{},
        stacks:{},
        invoke:{},
    };

    // forEach event type
    [    'upgradeSuccess', // image upgrades
        'upgradeFailure', // failure to upgrade after flipper.upgradeTries attempts
        'fetchCompletion', // fetching of the last thumbnail
        'draw', // draw operations
    ].forEach(function(hook){
        //declare a stack
        flipper.stacks[hook]=[];

        // and an 'on' method which will push to that stack
        flipper.on[hook]=function(f){
            if(typeof f == 'function'){
                flipper.stacks[hook].push(f);
            }
            return flipper;
        };

        // and a convenient callback for invocation on the occurrence of that event
        flipper.invoke[hook]=function(){
            invoke(flipper.stacks[hook]);
        };
    });

    flipper.canvasId=opt.canvas=opt.canvas||'canvas';
    
    var v=flipper.canvasElement=document.getElementById(opt.canvas);

    // context so we can work with our canvas
    var ctx=flipper.ctx=v.getContext('2d');

    // required
    if(!opt.thumbs){
        // complain and die if the user didn't pass in some values to use
        console.error("flippyFramey expects an object which specifies details \
regarding your thumbnail image set. \
See https://github.com/WilliamsNY/flippy-framey for more details");

        console.log("There are no sensible defaults we can assume.\
        \nTerminating flippyFramey execution NOW.");
        return;
    }else{
        var thumbs=flipper.thumbs=opt.thumbs;
        thumbs.images={};

        thumbs.validated=validate(thumbs);
        if(Object.keys(thumbs.validated).length){
            console.error(thumbs.validated);
        }
    }

    // check if they passed details for full quality image set
    if(!opt.full){
        // they did not, so set a flag so you don't ever bother to upgrade
        // you could just leave this falsey, but whatever
        flipper.canUpgrade=false;
    }else{
        // they did, so you're going to have to upgrade images
        //
        flipper.canUpgrade=true;
        
        // 'full' will only be defined if they passed it
        // so make sure your references to it are conditional upon the existence of 'flipper.canUpgrade'
        var full=flipper.full=opt.full;
        full.images={};

        full.validated=validate(full);
        if(Object.keys(full.validated).length){
            console.error(full.validated);
        }

        // there are a few other things that you should check for
        flipper.upgradeDelay=opt.upgradeDelay||50;
        flipper.upgradeTries=opt.upgradeTries||10;
    }

    // if the user provided a callback, execute it with a reference to the current state
    if(typeof opt.callback == 'function'){
        opt.callback(flipper);
    }

    // export some methods too

    // the user can specify their own loading mechanism
    // but it will fall back to a sensible default
    flipper.fetchThumbs=opt.fetchThumbs||fetchThumbs;
    flipper.drawThumb=drawThumb;

    // expose internal state (and functions) such that they can be hooked into a controller
    return flipper;

    // nothing but hoisted functions from here on
    function fetchThumbs(){
        var interval=window.setInterval(function(){
            if(typeof thumbs.images[thumbs.index] == 'undefined'){
                var src=thumbs.scheme(thumbs.index);
                console.log(src);
                thumbs.images[thumbs.index]=cache_image(src);
            }
            thumbs.index++;
            if(thumbs.index>=opt.frames){
                window.clearInterval(interval);
                flipper.invoke.fetchCompletion();
            }
        },50);
    };

    function drawImage(opt){
        ctx.drawImage(
            opt.image,
            0,
            0,
            opt.width,
            opt.height,
            0,
            0,
            flipper.canvasElement.width,
            flipper.canvasElement.height);
        // after an image has been drawn to the canvas..
        flipper.invoke.draw();
    };

    // wrap up drawImage since you probably just want to specify the index of the image
    function drawThumb(index){
        // cancel any pending upgrades, since we don't want to them to load and show at the wrong position
        if(flipper.pendingUpgrade){
            window.clearTimeout(flipper.pendingUpgrade);
        }

        // the user might have scrolled down past where the images have loaded
        if(!index in thumbs.images){
            var src=thumbs.scheme(index);
            var tries=flipper.upgradeTries;
            thumbs.images[index]=cache_image(src);
            flipper.pendingUpgrade=window.setInterval(function(){
                if(is_cached(src)){
                    drawImage({
                        image:thumbs.images[index],
                        width:thumbs.width,
                        height:thumbs.height,
                    });
                    window.clearInterval(flipper.pendingUpgrade);
                }else{
                    tries--;
                    if(!tries){
                        window.clearInterval(flipper.pendingUpgrade);
                    }
                }
            },flipper.upgradeDelay);
        }else{
            drawImage({
                image:thumbs.images[index],
                width:thumbs.width,
                height:thumbs.height,
            });
        }
        // set a timeout here to upgrade to full images, if a full image exists.
        if(flipper.canUpgrade){
            // if there's a pending timeout, cancel it
            // we don't want more than one image upgrading at time
            if(flipper.pendingUpgrade){
                window.clearTimeout(flipper.pendingUpgrade);
            }
            flipper.pendingUpgrade=window.setTimeout(function(){
                // pewpew
                // the user has scrolled and paused for $flipper.upgradeDelay ms

                // check if you already have the full version cached
                var fullSrc=full.scheme(index);
                if(is_cached(fullSrc)){
                    // you already have it, so just upgrade right away
                    drawFull(index);
                }else{
                    // you don't already have it, so go get it and save it
                    full.images[index]=cache_image(fullSrc);
                    // then draw it
                    // if you've gotten this far, then you can overwrite the current pendingUpgrade
                    // and replace that function with just the draw.
                    
                    var tries=flipper.upgradeTries;
                    window.clearTimeout(flipper.pendingUpgrade);
                    flipper.pendingUpgrade=window.setInterval(function(){
                        // if you have it, draw it and terminate the interval
                        if(is_cached(fullSrc)){
                            drawFull(index);
                            flipper.invoke.upgradeSuccess();
                            window.clearInterval(flipper.pendingUpgrade);
                            return;
                        }else{
                            tries--;
                            if(!tries){
                                // you failed to cache the image in the specified number of tries
                                // give up
                                window.clearInterval(flipper.pendingUpgrade);
                                flipper.invoke.upgradeFailure();
                                return;
                            }
                        }
                    },flipper.upgradeDelay);
                }
            },flipper.upgradeDelay);
        }
    };

    // wrap up drawImage for full images, only try to draw if full images are specified.
    function drawFull(index){
        if(flipper.canUpgrade){
            drawImage({
                image:full.images[index],
                width:full.width,
                height:full.height,
            });
        }else{
            // don't try to draw full images if you don't have them.
            return;
        }
    };

    // cache an image
    function cache_image(src){
        var img = new Image();
        img.src= src;
        return img;
    };

    // check if an image exists in your browser's cache
    function is_cached(src) {
        return cache_image(src).complete;
    };

    // invoke a stack of functions with the flipper object as an argument
    function invoke(stack){
        stack.forEach(function(func){
            func(flipper);
        });
    };

    function validate(cfg){
        var errors={};
        if(!(typeof cfg.width == 'number' && cfg.width > 0))
            errors.width="width should be a positive integer";

        if(!(typeof cfg.height == 'number' && cfg.height > 0))
            errors.height="height should be a positive integer";

        if(!(typeof cfg.scheme == 'function' && (typeof cfg.scheme(1) == 'string')))
            errors.scheme="scheme should be a function which takes an integer and returns a string";

        if(!(typeof cfg.index == 'number'))
            errors.index="index should be an integer";

        return errors;
    };
}
