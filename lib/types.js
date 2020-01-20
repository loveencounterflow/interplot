(function() {
  'use strict';
  var CND, Intertype, L, alert, badge, debug, help, info, intertype, jr, regex_cid_ranges, rpr, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'INTERPLOT/TYPES';

  debug = CND.get_logger('debug', badge);

  alert = CND.get_logger('alert', badge);

  whisper = CND.get_logger('whisper', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  info = CND.get_logger('info', badge);

  jr = JSON.stringify;

  Intertype = (require('intertype')).Intertype;

  intertype = new Intertype(module.exports);

  L = this;

  //-----------------------------------------------------------------------------------------------------------
  this.declare('interplot_shy', {
    tests: {
      "x is a text": function(x) {
        return this.isa.text(x);
      },
      "x ends with soft hyphen": function(x) {
        return x[x.length - 1] === '\u00ad';
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('interplot_template_name', {
    tests: {
      "x is a nonempty_text": function(x) {
        return this.isa.nonempty_text(x);
      },
      "x is name of template": function(x) {
        return this.isa.function((require('./templates'))[x]);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT consider to use JS regex unicode properties:

  ```
  /\p{Script_Extensions=Latin}/u
  /\p{Script=Latin}/u
  /\p{Script_Extensions=Cyrillic}/u
  /\p{Script_Extensions=Greek}/u
  /\p{Unified_Ideograph}/u
  /\p{Script=Han}/u
  /\p{Script_Extensions=Han}/u
  /\p{Ideographic}/u
  /\p{IDS_Binary_Operator}/u
  /\p{IDS_Trinary_Operator}/u
  /\p{Radical}/u
  /\p{White_Space}/u
  /\p{Script_Extensions=Hiragana}/u
  /\p{Script=Hiragana}/u
  /\p{Script_Extensions=Katakana}/u
  /\p{Script=Katakana}/u
  ```

  */
  regex_cid_ranges = {
    hiragana: '[\u3041-\u3096]',
    katakana: '[\u30a1-\u30fa]',
    kana: '[\u3041-\u3096\u30a1-\u30fa]',
    ideographic: '[\u3006-\u3007\u3021-\u3029\u3038-\u303a\u3400-\u4db5\u4e00-\u9fef\uf900-\ufa6d\ufa70-\ufad9\u{17000}-\u{187f7}\u{18800}-\u{18af2}\u{1b170}-\u{1b2fb}\u{20000}-\u{2a6d6}\u{2a700}-\u{2b734}\u{2b740}-\u{2b81d}\u{2b820}-\u{2cea1}\u{2ceb0}-\u{2ebe0}\u{2f800}-\u{2fa1d}]'
  };

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT kludge; this will be re-implemented in InterText */
  this.interplot_regex_cjk_property_terms = ['Ideographic'/* https://unicode.org/reports/tr44/#Ideographic */ , 'Radical', 'IDS_Binary_Operator', 'IDS_Trinary_Operator', 'Script_Extensions=Hiragana', 'Script_Extensions=Katakana', 'Script_Extensions=Hangul', 'Script_Extensions=Han'];

  //-----------------------------------------------------------------------------------------------------------
  this._regex_any_of_cjk_property_terms = function() {
    var t;
    return '[' + (((function() {
      var i, len, ref, results;
      ref = this.interplot_regex_cjk_property_terms;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        results.push(`\\p{${t}}`);
      }
      return results;
    }).call(this)).join('')) + ']';
  };

  //-----------------------------------------------------------------------------------------------------------
  this.declare('interplot_text_with_hiragana', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? has hiragana': function(x) {
        return (x.match(RegExp(`${regex_cid_ranges.hiragana}`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('interplot_text_with_katakana', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? has katakana': function(x) {
        return (x.match(RegExp(`${regex_cid_ranges.katakana}`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('interplot_text_with_kana', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? has kana': function(x) {
        return (x.match(RegExp(`${regex_cid_ranges.kana}`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('interplot_text_with_ideographic', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? has ideographic': function(x) {
        return (x.match(RegExp(`${regex_cid_ranges.ideographic}`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('interplot_text_hiragana', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? is hiragana': function(x) {
        return (x.match(RegExp(`^${regex_cid_ranges.hiragana}+$`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('interplot_text_katakana', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? is katakana': function(x) {
        return (x.match(RegExp(`^${regex_cid_ranges.katakana}+$`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('interplot_text_kana', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? is kana': function(x) {
        return (x.match(RegExp(`^${regex_cid_ranges.kana}+$`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('interplot_text_ideographic', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? is ideographic': function(x) {
        return (x.match(RegExp(`^${regex_cid_ranges.ideographic}+$`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('interplot_text_cjk', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? is cjk': function(x) {
        return (x.match(RegExp(`^${L._regex_any_of_cjk_property_terms()}+$`))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('interplot_text_with_cjk', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? has cjk': function(x) {
        return (x.match(RegExp(`${L._regex_any_of_cjk_property_terms()}+`))) != null;
      }
    }
  });

  // #-----------------------------------------------------------------------------------------------------------
  // @declare 'blank_text',
  //   tests:
  //     '? is a text':              ( x ) -> @isa.text x
  //     '? is blank':               ( x ) -> ( x.match ///^\s*$///u )?
  this.defaults = {
    settings: {
      merge: true
    }
  };

}).call(this);
