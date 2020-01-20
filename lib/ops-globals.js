(function() {
  //-----------------------------------------------------------------------------------------------------------
  globalThis.after = function(dts, f) {
    return setTimeout(f, dts * 1000);
  };

  globalThis.log = console.log;

  globalThis.warn = console.warn;

  globalThis.running_in_browser = function() {
    return this.window != null;
  };

  globalThis.jr = JSON.stringify;

  globalThis.as_plain_object = function(x) {
    return JSON.parse(JSON.stringify(x));
  };

  //-----------------------------------------------------------------------------------------------------------
  globalThis.js_type_of = function(x) {
    return ((Object.prototype.toString.call(x)).slice(8, -1)).toLowerCase().replace(/\s+/g, '');
  };

  //-----------------------------------------------------------------------------------------------------------
  globalThis.get_approximate_ratio = function(length, gauge, precision = 100) {
    return (Math.floor((length / gauge) * precision + 0.5)) / precision;
  };

}).call(this);
