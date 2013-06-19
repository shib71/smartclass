var test = require("tap").test;
var smartclass = require("../index");
var events = require("events");
var Q = require("q");

test("base smartclass",function(t){
  t.plan(6);

  t.equal(typeof(smartclass.extendWith),"function","smartclass has extendWith");
  t.equal(typeof(smartclass.classname),"string","smartclass has classname property");
  t.equal(smartclass.classname,"Class","smartclass classname property is correct");

  var instanceA = new smartclass();
  t.equal(typeof(instanceA.classname),"string","smartclass instance has classname property");
  t.equal(instanceA.classname,"Class","smartclass instance classname property is correct");
  t.equal(instanceA.toString(),"[object Class]","smartclass instance toString() result is correct");

  test("extend smartclass without a name",function(t){
    var extendedclass = "";

    t.plan(1);

    try{
      smartclass.extendWith({
        name : "Fred Nurk"
      });

      t.fail("extending smartclass without classname name should throw an error");
    }catch(e){
      t.equal(e.toString(),"extendWith must be passed a name argument","extending smartclass without classname name should throw an error");
    }

    t.end();
  });

  test("extend smartclass with an object",function(t){
    t.plan(10);

    var extendedclass = smartclass.extendWith("ExtendedClass",{
      greeting : "Hello World",
      greet : function(){
        return this.greeting;
      }
    });

    t.equal(typeof(extendedclass.extendWith),"function","extendedclass has extendWith");
    t.equal(typeof(extendedclass.classname),"string","extendedclass has classname property");
    t.equal(extendedclass.classname,"ExtendedClass","extendedclass classname property is correct");

    var instanceB = new extendedclass();
    t.equal(typeof(instanceB.classname),"string","extendedclass instance has classname property");
    t.equal(instanceB.classname,"ExtendedClass","extendedclass instance classname property is correct");
    t.equal(instanceB.toString(),"[object ExtendedClass]","extendedclass instance toString() result is correct");

    t.equal(typeof(instanceB.greeting),"string","extendedclass instance has custom property");
    t.equal(instanceB.greeting,"Hello World","extendedclass custom property is correct");
    t.equal(typeof(instanceB.greet),"function","extendedclass instance has custom function");
    t.equal(instanceB.greet(),"Hello World","extendedclass custom function returns correct value");

    t.end();
  });

  test("extend smartclass with a function",function(t){
    t.plan(7);

    var eventedclass = smartclass.extendWith("EventedClass",events.EventEmitter);

    t.equal(typeof(eventedclass.extendWith),"function","eventedclass has extendWith");
    t.equal(typeof(eventedclass.classname),"string","eventedclass has classname property");
    t.equal(eventedclass.classname,"EventedClass","eventedclass classname property is correct");

    var instanceC = new eventedclass();
    t.equal(typeof(instanceC.classname),"string","eventedclass instance has classname property");
    t.equal(instanceC.classname,"EventedClass","eventedclass instance classname property is correct");
    t.equal(instanceC.toString(),"[object EventedClass]","eventedclass instance toString() result is correct");

    instanceC.on("test",function(val){
      t.equal(val,"pang","eventedclass instance handled triggered event and argument");
    });
    instanceC.emit("test","pang");

    t.end();
  });

  test("extend smartclass with two parents",function(t){
    t.plan(11);

    var compositeclass = smartclass.extendWith("CompositeClass",events.EventEmitter,{
      greeting : "Hello World",
      greet : function(){
        return this.greeting;
      }
    });

    t.equal(typeof(compositeclass.extendWith),"function","compositeclass has extendWith");
    t.equal(typeof(compositeclass.classname),"string","compositeclass has classname property");
    t.equal(compositeclass.classname,"CompositeClass","compositeclass classname property is correct");

    var instanceD = new compositeclass();
    t.equal(typeof(instanceD.classname),"string","compositeclass instance has classname property");
    t.equal(instanceD.classname,"CompositeClass","compositeclass instance classname property is correct");
    t.equal(instanceD.toString(),"[object CompositeClass]","compositeclass instance toString() result is correct");

    t.equal(typeof(instanceD.greeting),"string","compositeclass instance has custom property");
    t.equal(instanceD.greeting,"Hello World","compositeclass custom property is correct");
    t.equal(typeof(instanceD.greet),"function","compositeclass instance has custom function");
    t.equal(instanceD.greet(),"Hello World","compositeclass custom function returns correct value");

    instanceD.on("test",function(val){
      t.equal(val,"pang","compositeclass instance handled triggered event and argument");
    });
    instanceD.emit("test","pang");

    t.end();
  });

  test("re-extend an extended smartclass",function(t){
    t.plan(20);

    var preextendedclass = smartclass.extendWith("PreextendedClass",events.EventEmitter);
    var reextenededclass = preextendedclass.extendWith("ReextendedClass",{
      greeting : "Hello World",
      greet : function(){
        return this.greeting;
      }
    });

    t.equal(typeof(preextendedclass.extendWith),"function","preextendedclass has extendWith");
    t.equal(typeof(preextendedclass.classname),"string","preextendedclass has classname property");
    t.equal(preextendedclass.classname,"PreextendedClass","preextendedclass classname property is correct");

    var instanceE = new preextendedclass();
    t.equal(typeof(instanceE.classname),"string","preextendedclass instance has classname property");
    t.equal(instanceE.classname,"PreextendedClass","preextendedclass instance classname property is correct");
    t.equal(instanceE.toString(),"[object PreextendedClass]","preextendedclass instance toString() result is correct");

    t.equal(typeof(instanceE.greeting),"undefined","preextendedclass instance has custom property");
    t.equal(typeof(instanceE.greet),"undefined","preextendedclass instance has custom function");

    instanceE.on("test",function(val){
      t.equal(val,"ping","preextendedclass instance handled triggered event and argument");
    });
    instanceE.emit("test","ping");

    t.equal(typeof(reextenededclass.extendWith),"function","reextenededclass has extendWith");
    t.equal(typeof(reextenededclass.classname),"string","reextenededclass has classname property");
    t.equal(reextenededclass.classname,"ReextendedClass","reextenededclass classname property is correct");

    var instanceF = new reextenededclass();
    t.equal(typeof(instanceF.classname),"string","reextenededclass instance has classname property");
    t.equal(instanceF.classname,"ReextendedClass","reextenededclass instance classname property is correct");
    t.equal(instanceF.toString(),"[object ReextendedClass]","reextenededclass instance toString() result is correct");

    t.equal(typeof(instanceF.greeting),"string","reextenededclass instance has custom property");
    t.equal(instanceF.greeting,"Hello World","reextenededclass custom property is correct");
    t.equal(typeof(instanceF.greet),"function","reextenededclass instance has custom function");
    t.equal(instanceF.greet(),"Hello World","reextenededclass custom function returns correct value");

    instanceF.on("test",function(val){
      t.equal(val,"pang","reextenededclass instance handled triggered event and argument");
    });
    instanceF.emit("test","pang");

    t.end();
  });

  test("unenumerable property",function(t){
    t.plan(2);

    var unenumeratedclass = smartclass.extendWith("UnenumeratedClass",{
      abc : 123,
      def : 456,
      unenumerable : ["def","toString"]
    });
    var instanceG = new unenumeratedclass();

    for (var k in instanceG){
      t.ok(["abc","classname"].indexOf(k)>-1,"["+k+"] only abc and classname are enumerated in unenumeratedclass");
    }

    t.end();
  });

  test("bound function",function(t){
    t.plan(1);

    var boundclass = smartclass.extendWith("BoundClass",{
      greeting : "Hello there",
      greet : function(){
        return this.greeting;
      },
      bind : ["greet"]
    });
    var instanceH = new boundclass();
    var fn = instanceH.greet;

    t.equals(fn(),"Hello there","boundclass bound function returns correct result");

    t.end();
  });

  test("promisified function result",function(t){
    t.plan(6);

    var promisifiedresultclass = smartclass.extendWith("PromisifiedResultClass",{
      greeting : "Hello ",
      greet : function(name){
        if (name==="throw")
          throw "Some error";
        else
          return this.greeting+name;
      },
      promisifyresult : ["greet"]
    });
    var instanceI = new promisifiedresultclass();
    var result = 0;

    result = instanceI.greet("Fred");
    t.ok(Q.isPromise(result),"promisifiedresultclass promisified function returns promise");
    result.then(function(v){
      t.equal(v,"Hello Fred","promisifiedresultclass returned promise is fulfilled with correct value");
    }).done();

    result = instanceI.greet(Q("Nirma"));
    t.ok(Q.isPromise(result),"promisifiedresultclass promisified function returns promise");
    result.then(function(v){
      t.equal(v,"Hello Nirma","promisifiedresultclass returned promise is fulfilled with correct value");
    }).done();

    result = instanceI.greet(Q("throw"));
    t.ok(Q.isPromise(result),"promisifiedresultclass promisified function returns promise");
    result.fail(function(err){
      t.equal(err.toString(),"Some error","promisifiedresultclass resolved with thrown error");
    }).done();
  });

  test("promisified function callback",function(t){
    t.plan(6);

    var promisifiedcallbackclass = smartclass.extendWith("PromisifiedCallbackClass",{
      greeting : "Hello ",
      greet : function(name,callback){
        if (name==="throw")
          callback("Some error");
        else
          callback(null,this.greeting+name);
      },
      promisifycallback : ["greet"]
    });
    var instanceJ = new promisifiedcallbackclass();
    var result = 0;

    result = instanceJ.greet("Jan");
    t.ok(Q.isPromise(result),"promisifiedcallbackclass promisified function returns promise");
    result.spread(function(v){
      t.equal(v,"Hello Jan","promisifiedcallbackclass returned promise is fulfilled with correct value");
    }).done();

    result = instanceJ.greet(Q("George"));
    t.ok(Q.isPromise(result),"promisifiedcallbackclass promisified function returns promise");
    result.spread(function(v){
      t.equal(v,"Hello George","promisifiedcallbackclass returned promise is fulfilled with correct value");
    }).done();

    result = instanceJ.greet(Q("throw"));
    t.ok(Q.isPromise(result),"promisifiedcallbackclass promisified function returns promise");
    result.fail(function(err){
      t.equal(err.toString(),"Some error","promisifiedcallbackclass resolved with thrown error");
    }).done();
  });

  test("init functions",function(t){
    t.plan(3);

    var initializedclass = smartclass.extendWith("InitializedClass",{
      init : function(v){
        t.equal(v,"A","Initial arguments passed into init initializedclass init function");
      }
    });
    var instanceK = new initializedclass("A");

    var extendedinitializedclass = initializedclass.extendWith("ExtendedInitializedClass",{
      init : function(v1,v2){
        t.equal(v2,"B","Initial arguments passed into init extendedinitializedclass init function");
      }
    });
    var instanceL = new extendedinitializedclass("A","B");

    t.end();
  });

  t.end();
});