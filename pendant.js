// pendant.js
var Pendant = function pendant(setup){
	// Internal variables

	var setup        = setup              || {};
	var delay        = setup.delay        || 0;
	var patient      = setup.patient      || false;
	// # of dependencies to be resolved
	var dependencies = 0;
	// # of dependencies resolved
	var resolved     = 0;
	// Functions waiting on dependencies 
	var dependants   = setup.dependants   || [];
	// Whether this pendant is resolved or not
	var fulfilled    = false;
	// Internal reference
	var pendant      = this;
	var countdown;


	// Exposed functions

	// Pass in function(s) for immediate execution:
	// It registers a dependency and passes reference to a function that resolves it.
	pendant.addDependency = function addDependency(dependency){
		if(!dependency)
			return pendant;

		if(countdown)
			clearTimeout(countdown);

		// Accepts multiple functions in array form or separate arguments.
		var newDependencies = 
			toString.call(dependency) == '[object Array]' 
			? dependency 
			: arguments;

		for(var i = 0, l = arguments.length; i < l; ++i){
			++dependencies;

			// Dependencies are executed immediately and passed a new resolution,
			// Which exposes a resolve function to be called as an when desired.
			newDependencies[i](resolution(), pendant);
		}

		return pendant;
	};

	// Pass in a function that gets called when all dependencies have been resolved,
	// or executes immediately if resolution has been fulfilled.
	pendant.addDependant = function addDependant(dependant){
		if(fulfilled && !patient){
			dependant(pendant);
		}
		else {
			dependants.push(dependant);
		}

		return pendant;
	};

	// Turn fulfillment on or off, useful for pausing til arbitrary points
	pendant.off          = function pendantOff(){
		pendant.patience = true;
		
		return pendant;
	};

	pendant.on           = function pendantOn(){
		pendant.patience = false;

		if(dependencies == resolved){
			attemptFulfillment();
		}

		return pendant;
	};

	pendant.getStatus    = function getStatus(){
		return {
			dependants   : dependants,
			dependencies : dependencies,
			fulfilled    : fulfilled,
			patient      : patient,
			resolved     : resolved
		};
	};


	// Internal functions

	// Initialise any passed-in dependencies
	setup.dependencies && void function init(){
		pendant.addDependency(setup.dependencies);
	}();

	function resolution(){
		// Internal state to prevent multiple resolutions of same dependency
		var dependencyResolved = false;

		// Exposed to dependency functions 
		return function resolve(){
			if(!dependencyResolved){
				++resolved;

				dependencyResolved = true;

				if(resolved >= dependencies){
					attemptFulfillment();
				}
			}

			// Return pendant to calling dependency function, 
			// Allows state-checking, further manipulation, etc
			return pendant;
		}
	}

	function attemptFulfillment(){
		if(patient){
			return;
		}

		countdown = setTimeout(function fulfill(){
			fulfilled = true;

			while(dependants.length){
				// Dependants are shifted out then executed.
				// Pendant can then be seen to have 0 dependants.
				dependants.shift()(pendant);
			}

			// Clear reference
			countdown = void 0;
		}, delay);
	}

	return this;
};
