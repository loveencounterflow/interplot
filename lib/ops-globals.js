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

  globalThis.sleep = function(dts) {
    return new Promise((done) => {
      return setTimeout(done, dts * 1000);
    });
  };

  globalThis.as_plain_object = function(x) {
    return JSON.parse(JSON.stringify(x));
  };

  globalThis.as_html = function(dom_or_jquery) {
    return (as_dom_node(dom_or_jquery)).outerHTML;
  };

  //-----------------------------------------------------------------------------------------------------------
  globalThis.js_type_of = function(x) {
    return ((Object.prototype.toString.call(x)).slice(8, -1)).toLowerCase().replace(/\s+/g, '');
  };

  //-----------------------------------------------------------------------------------------------------------
  globalThis.get_approximate_ratio = function(length, gauge, precision = 100) {
    return (Math.floor((length / gauge) * precision + 0.5)) / precision;
  };

  //-----------------------------------------------------------------------------------------------------------
  globalThis.as_dom_node = function(dom_or_jquery) {
    if ((typeof (dom_or_jquery != null ? dom_or_jquery.jquery : void 0)) === 'string') {
      return dom_or_jquery[0];
    }
    return dom_or_jquery;
  };

}).call(this);
