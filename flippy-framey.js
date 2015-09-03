function flippyFramey(opt){
	// make sure configuration options were passed, or use documented defaults
	opt=opt||{};

	/* 
		this object will be returned by this initiatialization function
		such that the user will be able to check up on state
		and make changes to the function's behaviour at runtime
	*/
	var flipper={};

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
		// they passed in a value, for now let's just assume it's valid
		// FIXME actually validate their input?
		var thumbs=flipper.thumbs=opt.thumbs;
		/*
			They should have passed:
				width: a positive integer,
				height: a positive integer,
				scheme: a function which returns a url when given an index,
				images: an array,
				index: a non-negative integer, probably 0
		*/
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

		// TODO validate flipper.full using the same criteria applied to flipper.thumbs (once that's done)
		// unlike thumbs, full's images attribute should refer to an object, not an array

		// there are a few other things that you should check for
		// 
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

	// drop generally useful functions down here

	function fetchThumbs(){
		var interval=window.setInterval(function(){
			var src=thumbs.scheme(thumbs.index++);
			console.log(src);
			thumbs.images.push(cache_image(src));

			if(thumbs.index>=opt.frames){
				window.clearInterval(interval);
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
		if(flipper.canUpgrade){
			// set a singleton timeout such that if the image is not changed
			// it will upgrade to a full quality version of the same image
		}
	};

	// wrap up drawImage since you probably just want to specify the index of the image
	function drawThumb(index){
		drawImage({
			image:thumbs.images[index],
			width:thumbs.width,
			height:thumbs.height,
		});
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
							window.clearInterval(flipper.pendingUpgrade);
							return;
						}else{
							tries--;
							if(!tries){
								// you failed to cache the image in the specified number of tries
								// give up
								window.clearInterval(flipper.pendingUpgrade);
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

	// check if an image exists in your browser's cache
	function is_cached(src) {
		var image = new Image();
		image.src = src;
		return image.complete;
	};

	function cache_image(src){
		var img = new Image();
		img.src= src;
		return img;
	};
}
