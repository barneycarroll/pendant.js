pendant.js
========

Pendant.js is a variation on the [Observer](http://en.wikipedia.org/wiki/Observer_pattern) and [Promise](http://wiki.commonjs.org/wiki/Promises/A) patterns with a focus on dynamically extensible dependencies.

A Pendant describes conditions to be resolved (dependencies) before a fulfillment event is triggered, leading to the execution of outcomes (dependants).

A Pattern differs from a Promise in that it can be extended (dependencies and dependants can be added after definition, partial and/or total fulfillment), and dependency resolution only comes in a single flavour: resolved (as opposed to success, failure, progress). However, each dependency's resolve function gets access to, and can modify, the Pendant's internal resolution object (available to dependant functions on fulfillment), allowing users to create messaging systems according to their needs.

# Usage

Create pendants with new Pendant.

Key methods are addDependant and addDependency.

Dependencies are functions that get passed a resolve function to call when their conditions have been met.

Dependants are functions that will execute when all dependencies have resolved.

You can turn it on or off.

Check its state with getStatus.

And you can set it up with new Pendant({key:identifier}) to then retrieve it with Pendant.get(identifier)


The crucial thing is that you can add dependencies asynchronously.
So one AJAX call might result for whatever reason in calling another piece of data. You can keep on adding dependencies.

Example
=======

There's an abstract event, which is when all the page's resources are ready. I need to do various things when I know that's all happened. So I create a Pendant.

    var resourcesReady = new Pendant({
      key          : 'resourcesReady',
    	dependencies : [
    		function pageLoad(resolve){
    			$(window).on('load', resolve);
    		}
    	],
    	dependants   : [
    		function reOrderLayout(){
    			$('body').masonry({
    				itemSelector: '.block'
    			});
    		}
    	]
    });

The initial conditions are pretty simple. One of my dependant actions is that I want to use the awesome Masonry jQuery plugin to make the layout all funky - it's dependent on resources being ready because images need to load before their dimensions are known to us. So I'm also setting up that dependency there. 
_Dependencies_ are functions that get provided with a special function as an argument (labelled `resolve` here), which, when executed, tells the Pendant that this particular dependency has been resolved. When all dependencies are resolved, the dependant functions execute.

Anyway, I later realise there are more functions that depend upon `resourcesReady`'s conditions being met.

    void function hidePageUntilReady(){
    	$('html').css('visibility', 'hidden');

    	resourcesReady.addDependant(function revealPage(){
    		$('html').css('visibility', 'visibility');
    	});
    }();

Specifically, I don't want the user seeing the page before it's ready. So I invoke `resourcesReady`'s `addDependant` function.

Later on, in another file…

    Pendant.get('resourcesReady')
    	.addDependency(function getContentFrom3rdParty(resolve, pendant){
    		$.ajax({
    			success : AJAXcallback(data){
    				var resolution = $.extend(
    					{'socialmediaData' : data}, 
    					pendant.resolution()
    				);

    				resolve(resolution);
    			},
    			url     : 'socialmedia.com'
    		});
    	})
    	.addDependant(function tellUserAboutSocialMedia(pendant){
    		alert('Read this from the Internet: \n' + pendant.resolution.socialmediaData);
    	});

We've changed scope, meaning the `resourcesReady` variable is no longer available. No worries, the Pendant object has a get method that can retrieve Pendants that were given a key at construction time.

Here I'm writing some AJAX stuff which has little to do with Masonry, but does affect our pendant in that it brings in new content asynchronously. And that new content should be exposed to `resourcesReady`'s dependants.

In one fell chained operation, we make use of the fact that Pendants always return themselves unless they were asked for specific data. In `addDependency`, we set up our AJAX call. We'll make use of the fact that new dependencies also get passed the pendant to safely store the AJAX data alongside any other dependency resolution data that may have been stored in there. `pendant.resolutions()` returns a data store within the pendant: we extend this into a new object containing the AJAX data under new property `socialmediaData`. Next we add a new dependant, which calls the pendant's resolution store to retrieve the `socialmediaData`. 

FIN
