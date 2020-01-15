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

}).call(this);
