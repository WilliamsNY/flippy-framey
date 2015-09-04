# flippy framey

Efficiently load and display images in the classic flipbook style.

## Description

We wanted to be able to build web pages that featured animations in the classic [flipbook style](https://www.youtube.com/watch?v=UocF4ycBnYE) which could be driven by [scroll position](https://github.com/WilliamsNY/rolly-scrolly), or feasibly some other incrementor/decrementor.

You can see an example [here](http://williamsny.github.io/flippy-framey/).

## Features

* Animates through a set of images by rendering them on an HTML5 canvas
* Loads lower quality images and upgrades to high quality versions if the animation is paused

## Usage

> **WIP** This is a Work in Progress and shouldn't be treated as stable. _Soon_.

This library exports a single function, `flippyFramey`. It takes a single argument, an object of configuration options.

The function assumes:

* you have already included jquery for the page
  + (if there's a demand for it a pure js version could be made, but we use jQuery and so does almost everyone else). If you're curious, we use:
    - the selector syntax
    - animate (for scrollTo)
    - `.css()`
    - `.height()`
    - `.width()`
    - `.on()`
    - `.resize()`
* you have a canvas somewhere on the page
* you have two sets of images (low and high quality)
* your images are hosted somewhere, and:
  + your image sets follow a consistent naming scheme
  + your image sets have consistent sizes (identical pixel measurements)
* you have a consistent naming scheme for low and high quality images

Below you'll find an example of how you can call the `flippyFramey` function. This example passes the options that would be used by default anyway, so any configuration attributes that suit your purposes can be omitted at your discretion.

```Javascript

// there are no sensible defaults for these values
// just define them outside of the function call and pass them in
var thumbs={
	width:640,
	height:413,
	images:[],
	scheme:function(index){
		return 'http://your.content.distribution.network/and/naming/scheme/thumbs/image_'+index;
	},
	index:0,
};
var full={
	width:2048,
	height:1320,
	images:[],
	scheme:function(index){
		return 'http://your.content.distribution.network/and/naming/scheme/thumb/image_'+index;
	},
	index:0,
};

var flipper=flippyFramey({
	/* WIP */
	// flippyFramey will draw to the canvas with the following id
	canvas:'canvas',

	// the image index from which you'd like to start counting
	state:0,

	// passing in the details for our thumbnail image set defined above
	thumbs:thumbs,

	// passing in the details for our full quality image set defined above
	full:full,

	// the time an image must remain static before upgrading to the full quality version
	// this never gets used unless you pass an actual value to the 'full' attribute
	// 50ms is probably good
	upgradeDelay:50,	

	// how many times should you try to upgrade before giving up?
	upgradeAttempts:10,

	callback:function(flipperState){
		// when function setup is complete, this function will be called
		// don't confuse this with whether all the thumbnails have been loaded
		// that might be added as an additional option, but not yet

		// flipperState is just the same object that is used internally within flippyFramey
		// that object is returned and assigned to 'flipper' within this example
	},
});
```

## Credits

Written by [Williams New York](http://williamsnewyork.com)

### Authors

* [Aaron MacSween](https://github.com/ansuz)

## LICENSE

Licensed under the [MIT license](http://opensource.org/licenses/MIT).
