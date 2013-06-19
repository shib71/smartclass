// module returns base class object
// instantiating it returns a class with no functionality (init arguments are not stored anywhere)
// object assumes it will be called with "new" - doesn't attempt to fix user's mistake
// class has extendWith function which returns a new class
// class returned by extendWith has extendWith class
// extended with adds itself to results
var util = require("util"), Q = require("q");

module.exports = baseclass = function(){}

baseclass.classname = baseclass.prototype.classname = "Class";
baseclass.metaprops = ["init","unenumerable","bind","promisifyresult","promisifycallback"];

baseclass.extendWith = function extendWith(){
  var self = this, args = Array.prototype.slice.call(arguments), name = args.shift();

  if (typeof(name) !== "string")
    throw "extendWith must be passed a name argument";

  var fnResult = function(){
    var val = "";

    self.apply(this,arguments);

    for (var i=0, ii=args.length; i<ii; i++){
      if (typeof(args[i])==="function"){
        args[i].apply(this,arguments);
      }
      else{
        for (var k in args[i]){
          if (typeof(this[k])==="function" && baseclass.metaprops.indexOf(k)===-1){
            if (args[i].promisifyresult && args[i].promisifyresult.indexOf(k)>-1)
              this[k] = ify(this,this[k],"promisifyresult");
            else if (args[i].promisifycallback && args[i].promisifycallback.indexOf(k)>-1)
              this[k] = ify(this,this[k],"promisifycallback");
            else if (args[i].bind && args[i].bind.indexOf(k)>-1){
              this[k] = ify(this,this[k],"bind");
            }
          }
        }
      }
    }

    for (var i=0, ii=args.length; i<ii; i++){
      if (args[i].init){
        args[i].init.apply(this,arguments);
      }
    }
  };

  util.inherits(fnResult,self);

  for (var i=0, ii=args.length; i<ii; i++){
    if (typeof(args[i])==="function"){
      util.inherits(fnResult,args[i]);
    }
    else{
      for (var k in args[i]){
        if (baseclass.metaprops.indexOf(k)===-1){
          Object.defineProperty(fnResult.prototype,k,{
            value : args[i][k],
            enumerable : !args[i].unenumerable || args[i].unenumerable.indexOf(k)===-1,
            writable : true
          });
        }
      }
    }
  }

  fnResult.classname = fnResult.prototype.classname = name;
  fnResult.extendWith = baseclass.extendWith;

  Object.defineProperty(fnResult.prototype,"toString",{
    value : function(){ return "[object "+this.classname+"]"; },
    enumerable :false
  });

  return fnResult;
}

Object.defineProperty(baseclass.prototype,"toString",{
  value:function(){ return "[object "+this.classname+"]"; },
  enumerable:false
});

Object.defineProperty(baseclass.prototype,"keys",{
  value:function(){
    var a = [];

    for (var k in this){
      a.push(k);
    }

    return a;
  },
  enumerable:false
});


function ify(obj,fn,promisify){
  var _fn = fn;

  if (typeof(fn)!=="function")
    throw "not a function";

  switch(promisify){
    case "bind":
      if (!fn.bound){
        _fn = function(){
          return fn.apply(obj,arguments);
        };
        _fn.bound = true;
      }
      break;
    case "promisifyresult":
      if (!fn.promisified){
        _fn = function(){
          return deepResolve(Array.prototype.slice.call(arguments)).then(function(args){
            return Q.when(fn.apply(obj,args));
          });
        };
        _fn.promisified = true;
        _fn.bound = true;
      }
      break;
    case "promisifycallback":
      if (!fn.promisified){
        _fn = function(){
          return deepResolve(Array.prototype.slice.call(arguments)).then(function(args){
            var result = Q.defer();

            args.push(function(){
              var args = Array.prototype.slice.call(arguments), err = args.shift();

              if (err)
                result.reject(err);
              else
                result.resolve(args);
            });
            fn.apply(obj,args);

            return result.promise;
          });
        };
        _fn.promisified = true;
        _fn.bound = true;
      }
      break;
  }

  return _fn;
}

function deepResolve(val){
    var queue = [];

    if (val && val.constructor == Array){
        val.forEach(function(v,i){
            queue.push(resolveChild(val,v,i));
        });
    }
    else if (val && val.constructor == Object){
        for (var k in val){
            queue.push(resolveChild(val,val[k],k));
        }
    }

    return Q.all(queue).then(function(){
        return val;
    });
}

function resolveChild(val,v,i){
    var result = true;

    if (Q.isPromise(v)){
        result = v.then(function(resolvedval){
            val[i] = resolvedval;
            if (val[i] && (val[i].constructor==Array || val[i].constructor==Object))
                return deepResolve(val[i]);
            else
                return true;
        });
    }
    else if (v && (v.constructor==Array || v.constructor==Object)){
        result = deepResolve(v);
    }

    return result;
}
