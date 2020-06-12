(function() {
  'use strict';
  var k, v;

  if (globalThis.µ == null) {
    globalThis.µ = {};
  }

  µ.TYPES = new (require('intertype')).Intertype();

  µ.rpr = require('util-inspect');

  if (µ.TMP == null) {
    µ.TMP = {};
  }

  µ.TMP._css_properties = require('./css-properties.js');

  µ.TMP._css_font_properties = ((function() {
    var ref, results;
    ref = µ.TMP._css_properties;
    results = [];
    for (k in ref) {
      v = ref[k];
      if (v.fonts) {
        results.push(k);
      }
    }
    return results;
  })()).sort();

  // INTERTEXT 								= require 'intertext'
// { HYPH, }									= INTERTEXT
// console.log '^4453-2^', INTERTEXT
// console.log '^4453-3^', HYPH
// console.log '^4453-4^', HYPH.reveal_hyphens HYPH.hyphenate "welcome to the world of InterText hyphenation!"

  // browserify lib/experiments/browserify-modules.js --ignore-missing -o public/browserified.js

}).call(this);

//# sourceMappingURL=browserify-modules.js.map