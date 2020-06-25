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

  //-----------------------------------------------------------------------------------------------------------
  globalThis.js_type_of = function(x) {
    return ((Object.prototype.toString.call(x)).slice(8, -1)).toLowerCase().replace(/\s+/g, '');
  };

  //-----------------------------------------------------------------------------------------------------------
  globalThis.get_approximate_ratio = function(length, gauge, precision = 100) {
    return (Math.floor((length / gauge) * precision + 0.5)) / precision;
  };

  //-----------------------------------------------------------------------------------------------------------
  globalThis._KW_as_dom_node = function(dom_or_jquery) {
    if ((typeof (dom_or_jquery != null ? dom_or_jquery.jquery : void 0)) === 'string') {
      return dom_or_jquery[0];
    }
    return dom_or_jquery;
  };

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT intermediate solution until intertext can be browserified */
  if (globalThis.INTERTEXT == null) {
    globalThis.INTERTEXT = {};
  }

  //-----------------------------------------------------------------------------------------------------------
  INTERTEXT.camelize = function(text) {
    /* thx to https://github.com/lodash/lodash/blob/master/camelCase.js */
    var i, idx, ref, word, words;
    words = text.split('-');
    for (idx = i = 1, ref = words.length; i < ref; idx = i += +1) {
      word = words[idx];
      if (word === '') {
        continue;
      }
      words[idx] = word[0].toUpperCase() + word.slice(1);
    }
    return words.join('');
  };

  globalThis.fontmetricsdemo = function() {
    return 
  const textMetrics = require('text-metrics');

  const el = document.querySelector('column');
  const metrics = textMetrics.init(el);

  log( metrics.width('unicorns') );
  // -> 210

  log( metrics.height('Some long text with automatic word wraparound') );
  // -> 180
  log( metrics.lines('Some long text with automatic word wraparound') );
  // -> ['Some long text', 'with automatic', 'word', 'wraparound']
  log( metrics.maxFontSize('Fitting Headline') );
  // -> 33px
  ;
  };

}).call(this);

//# sourceMappingURL=ops-globals.js.map