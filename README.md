# flippy framey

Efficiently load and display images in the classic flipbook style.

## Description

We wanted to be able to build web pages that featured animations in the classic [flipbook style](https://www.youtube.com/watch?v=UocF4ycBnYE) which could be driven by [scroll position](https://github.com/WilliamsNY/rolly-scrolly), or feasibly some other incrementor/decrementor.

You can see an example [here](http://williamsny.github.io/flippy-framey/).

## Features

* Animates through a set of images by rendering them on an HTML5 canvas
* Loads lower quality images and upgrades to high quality versions if the animation is paused

## Usage

This library exports a single function, `flippyFramey`. It takes a single argument, an object of configuration options.

The function assumes:

* you have a canvas somewhere on the page
* you have at least one sets of images and no more than two (low and high quality)
* your images are hosted somewhere, and:
  * your image sets follow a consistent naming scheme
  * your image sets have consistent sizes (identical pixel measurements)

Below you'll find an example of how you can call the `flippyFramey` function. This example passes the options that would be used by default anyway, so any configuration attributes that suit your purposes can be omitted at your discretion.

```Javascript
// there are no sensible defaults for these values
// just define them outside of the function call and pass them in
var thumbs={
    width:960,
    height:540,
    scheme:function(index){
        return 'http://your.content.distribution.network/and/naming/scheme/thumbs/image_'+index;
    },
    index:0,
};
var full={
    width:1920,
    height:1080,
    scheme:function(index){
        return 'http://your.content.distribution.network/and/naming/scheme/thumb/image_'+index;
    },
    index:0,
};

var flipper=flippyFramey({
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
    upgradeTries:10,

    callback:function(flipperState){
        // when function setup is complete, this function will be called
        // don't confuse this with whether all the thumbnails have been loaded
        // that might be added as an additional option, but not yet

        // flipperState is just the same object that is used internally within flippyFramey
        // that object is returned and assigned to 'flipper' within this example
    },
});
```

The object returned by flippyFramey has attributes that you can then use to manipulate it's behaviour.

For instance, you can extend it via a number of hooks, like so:

```Javascript
flipper.on.fetchCompletion(function(){
    // maybe you didn't want to allow the user to scroll
    // until all the images had been loaded..
    // start with scrolling disabled
    // then enable it here
});

flipper.on.upgradeFailure(function(){
    // notify when a full quality image has failed to load
});

flipper.on.upgradeSuccess(function(){
    // notify when an image has successfully upgraded to a full quality version
});

flipper.on.draw(function(){
    // called whenever an image is drawn to the canvas
});
```

## Credits

Written by [Williams New York](http://williamsnewyork.com)

### Authors

* [Aaron MacSween](https://github.com/ansuz)

## LICENSE

Licensed under the [MIT license](http://opensource.org/licenses/MIT).
