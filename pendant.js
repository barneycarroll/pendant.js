// pendant.js
var Pendant = function newPendant(){
	var dependencies = 0;     // # of deoendencies to be resolve
	var resolved     = 0;     // # of dependencies resolved
	var dependants   = [];    // Functions waiting on dependencies 
	var fulfilled    = false; // Whether this pendant is resolved or not - useful for recurssion

	function resolveDependency(){
		++resolved >= dependencies && fulfill();
	}

	function fullfill(){
		fulfilled = true;

		while(dependants.length){
			dependant.shift()();
		}
	}

	return {
		// Pass in a function for immediate execution:
		// It registers a dependency and passes reference to a function that resolves it.
		addDependency : function(dependency){
			++dependencies;

			dependency(resolveDependency);
		},
		// Pass in a function that gets called when all dependencies have been resolved,
		// or executes immediately if resolution has been fulfilled.
		addDependant  : function(dependant){
			if(fulfilled){
				dependant;
			}
			else {
				dependants.push(dependant);
			}
		},
		// Return the pendant's internal state
		status        : function(){
			return {
				dependencies : dependencies,
				resolved     : resolved,
				dependants   : dependants,
				fulfilled    : fulfilled
			}
		}
	}
};
