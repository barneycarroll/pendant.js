/* Pendant.js v0.1.4
 *
 * https://github.com/barneycarroll/pendant.js/
 *
 * This work is licensed under the Creative Commons Attribution 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by/3.0/.
 */
void function pendantInit(context){
	// Store to cache pendants without the need to keep a reference in scope
	var pendants = {};

	// Retrieval method
	function getPendant(key){
		if(key && pendants[key]){
			return pendants[key];
		}
		else {
			return pendants;
		}
	}

	// Bind constructor to context
	context.Pendant     = function pendantAccessor(x){
		return new Pendant(x);
	};

	// ...And bind the getter too
	context.Pendant.get = getPendant;

	// Let's make a pendant!
	function Pendant(setup){

		// Internal reference

		// An internal reference to self, to avoid confusion downscope
		var pendant      = this;
		var config       = setup            || {};
		// Specifying a key allows retrieval from the calling context's Pendant object
		var key          = config.key        && (function addPendant(){
			pendants[config.key] = pendant;
		}())                                || void(0);
		// Milliseconds until fulfillment after final resolution
		var delay        = config.delay      || 0;
		// Patience defers fulfillment until the pendant is turned back on
		var patience     = config.patience   || false;
		// # of dependencies to be resolved, to be compared to...
		var dependencies = 0;
		// # of dependencies resolved
		var resolved     = 0;
		// Functions waiting on dependencies
		var dependants   = config.dependants || [];
		// Whether this pendant is resolved or not
		var fulfilled    = false;
		// Reference timeout for delayed fullfillment
		var countdown;
		// Accessible to dependency resolution and dependant functions
		var resolution;

		// Internal functions

		// Initialise any passed-in dependencies
		if(config.dependencies){
			pendant.addDependency(config.dependencies);
		}

		// Create a new resolution function to pass to a dependency
		function makeResolution(){
			// Internal resolution state
			var dependencyResolved = false;

			// Exposed to dependency functions
			return function resolve(data){
				// User can pass in arbitrary data to be stored in the pendant
				if(data){
					resolution = data;
				}

				if(!dependencyResolved){
					// Maintain count
					++resolved;

					// Prevent re-execution
					dependencyResolved = true;

					// Trigger fulfillment if need be
					if(dependencies == resolved){
						attemptFulfillment();
					}
				}

				// Return pendant to calling dependency function,
				// Allows state-checking, further manipulation, etc
				return pendant;
			};
		}

		function attemptFulfillment(){
			// Pendant needs to be turned on before execution
			if(patience){
				return;
			}

			function fulfill(){
				while(dependants.length){
					// Dependants are shifted out then executed.
					// Pendant can then be seen to have 0 dependants.
					dependants.shift()(pendant);
				}

				fulfilled = true;

				// Clear reference
				countdown = void 0;
			}

			// If it doesn't, execute the pendant!
			countdown = setTimeout(fulfill, delay);
		}


		// Exposed functions

		// Pass in function(s) for immediate execution:
		// It registers a dependency and passes reference to a function that resolves it.
		pendant.addDependency = function addDependency(){
			// Stop everything, new conditions incoming!
			if(countdown){
				clearTimeout(countdown);
			}

			var newDependencies = arguments;

			for(var i = 0, l = newDependencies.length; i < l; ++i){
				++dependencies;

				// Dependencies are executed immediately and passed a new resolution,
				// Which exposes a resolve function to be called as an when desired.
				newDependencies[i](makeResolution(), pendant);
			}

			return pendant;
		};

		// Pass in a function that gets called when all dependencies have been resolved,
		// or executes immediately if resolution has been fulfilled.
		pendant.addDependant = function addDependant(){
			var newDependants = arguments;

			for(var i = 0, l = newDependants.length; i < l; ++i){
				if(fulfilled && !patience && !countdown){
					newDependants[i](pendant);
				}
				else {
					dependants.push(newDependants[i]);
				}
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

		// Getters
		pendant.get          = function getInfo(){
			return {
				dependants   : dependants,
				dependencies : dependencies,
				fulfilled    : fulfilled,
				key          : key,
				patience     : patience,
				resolved     : resolved,
				resolution   : resolution
			};
		};

		return pendant;
	}
}(this);
