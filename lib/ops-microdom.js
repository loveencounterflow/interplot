(function() {
  'use strict';
  var Micro_dom;

  Micro_dom = (function() {
    var k;

    //===========================================================================================================
    class Micro_dom { // extends Multimix
      
        //-----------------------------------------------------------------------------------------------------------
      ready(f) {
        // thx to https://stackoverflow.com/a/7053197/7568091
        // function r(f){/in/.test(document.readyState)?setTimeout(r,9,f):f()}
        types.validate.function(f);
        if (/in/.test(document.readyState)) {
          return setTimeout((() => {
            return this.ready(f);
          }), 9);
        }
        return f();
      }

    };

    console.log((function() {
      var results;
      results = [];
      for (k in Micro_dom) {
        results.push(k);
      }
      return results;
    }).call(this));

    return Micro_dom;

  }).call(this);

  // provide_µ.apply globalThis.µ = {}
  (globalThis.µ != null ? globalThis.µ : globalThis.µ = {}).DOM = new Micro_dom();

}).call(this);

//# sourceMappingURL=ops-microdom.js.map