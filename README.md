SmartClass is a module for easily creating and extending classes:

* create a new class with `var NewClass = require("smartclass").extendWith("NewClass",EventEmitter)`
* create a child of an existing smart class with `var ExtendedClass = NewClass.extendWith("ExtendedClass",{...})`
* extendWith accepts a name, then any number of extensions. Extensions can be existing JavaScript
  'classes', like EventEmitter, and objects defining properties, methods, and meta-properties
* the name of the class can be accessed on the class itself and any instance of the class through the
  'classname' property
* *init*: extending objects can contain an `init` function which is called with the creation
  arguments, i.e `var instance = new NewClass(123)` would result in init(123) being called.
  The same set of arguments will be passed to every init method defined for the class and it's
  ancestors in the *order of extension*. That means the first class to extend SmartClass will have
  it's init methods called, *then* any class that extends it. Similarly all the binding and resolution
  functionality described below will be applied before init is called.
* *unenumerable*: an array of names of properties and methods that should not be included in `for ... in ..`
  constructions, JSON representations, or simple console dumps
* *bind*: an array of names of methods that should be bound to the class instance, so that they
  are always executed in the context of that instance
* *promisifyresult*: an array of names of methods that are to be updated to automatically resolve
  promise arguments and return a promise result. Note that SmartClass will recurse into the arguments
  entirely and resolve both promises nested in objects and arrays, and promises returned by
  previously resolved promises. If you need to handle promise arguments more precisely, then you
  should do it yourself and not use this functionality.
* *promisifycallback*: the same as promisifyresult, but instead of resolving the returned promise
  with the return value of the function, resolves it with a callback. The callback is always passed
  as the last argument and itself always takes arguments in the form `fn(error,arg1,arg2,...,argN)`
* *getters / setters* can be added to a class with a special "value" - an object containing `get` 
  and `set` function properties.