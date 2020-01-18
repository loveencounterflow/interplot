(function() {
  //-----------------------------------------------------------------------------------------------------------
  globalThis.after = function(dts, f) {
    return setTimeout(f, dts * 1000);
  };

  globalThis.log = console.log;

  globalThis.running_in_browser = function() {
    return this.window != null;
  };

  globalThis.jr = JSON.stringify;

  globalThis.get_approximate_ratio = function(length, gauge, precision = 100) {
    return (Math.floor((length / gauge) * precision + 0.5)) / precision;
  };

}).call(this);
