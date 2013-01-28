pendant.js
==========

Observer pattern library with a focus on dynamically extensible dependencies

Usage
=====

Create pendants with new Pendant.

Key methods are addDependant and addDependency.

Dependencies are functions that get passed a resolution function to call when their esoteric callbacks are happy.

Dependants are functions that will execute when all dependencies have resolved.

You can turn it on or off.

Check its state with getStatus.

And you can set it up with new Pendant({key:identifier}) to then retrieve it with Pendant.get(identifier)


The crucial thing is that you can add dependencies asynchronously.
So one AJAX call might result for whatever reason in calling another piece of data. You can keep on adding dependencies.
