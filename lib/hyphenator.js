(function() {
  'use strict';
  var CND, badge, cast, info, isa, rpr, type_of, types, validate;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'INTERPLOT/HYPHENATOR';

  // debug                     = CND.get_logger 'debug',     badge
  // alert                     = CND.get_logger 'alert',     badge
  // whisper                   = CND.get_logger 'whisper',   badge
  // warn                      = CND.get_logger 'warn',      badge
  // help                      = CND.get_logger 'help',      badge
  // urge                      = CND.get_logger 'urge',      badge
  info = CND.get_logger('info', badge);

  // PATH                      = require 'path'
  // FS                        = require 'fs'
  // { jr, }                   = CND
  // assign                    = Object.assign
  // join_path                 = ( P... ) -> PATH.resolve PATH.join P...
  //...........................................................................................................
  types = require('./types');

  ({isa, validate, cast, type_of} = types);

  //-----------------------------------------------------------------------------------------------------------
  /* thx to https://stackoverflow.com/a/881111/7568091, https://jsperf.com/performance-of-match-vs-split */
  this.soft_hyphen_chr = '\u00ad';

  this.soft_hyphen_pattern = /\u00ad/g;

  this.count_soft_hyphens = function(text) {
    return (text.split(this.soft_hyphen_chr)).length - 1;
  };

  this.reveal_hyphens = function(text, replacement = '-') {
    return text.replace(this.soft_hyphen_pattern, replacement);
  };

  this.show_hyphenation = function(text, replacement = '-') {
    return info(this.reveal_hyphens(text, replacement));
  };

  //-----------------------------------------------------------------------------------------------------------
  this.new_hyphenator = function() {
    /* https://github.com/mnater/Hyphenopoly */
    /* return value of call to `config()` is hyphenation function when `require` contain one element, a map
    from language codes to functions otherwise; this we fix here: */
    /* see https://github.com/mnater/Hyphenopoly > docs > Setup.md */
    var H9Y, _hyphenators/* also available as per-language setting */, settings;
    H9Y = require('hyphenopoly/hyphenopoly.module');
    settings = {
      // hyphen:     '\u00ad'
      //         "exceptions": {
      //             "de": "Algo-rithmus",
      //             "global": "Silben-trennung"
      //         "exceptions": {"de": "Algo-rithmus, Algo-rithmus"},
      // exceptions: {"global": "Silben-trennung"},
      sync: true,
      require: ['en-us'], // [ "de", "en-us"],
      orphanControl: 1/* allow orphans */,
      compound: 'auto'/* all, auto, hyphen; `all` inserts ZWSP after existing hyphen */,
      normalize: false/* if true, transforms text to some kind of Unicode normal form */,
      mixedCase: true,
      minWordLength: 4,
      leftmin: 2/* also available as per-language setting */,
      rightmin: 2
    };
    _hyphenators = H9Y.config(settings);
    validate.function(_hyphenators);
    return _hyphenators;
  };

  // switch ( type = type_of _hyphenators )
//   when 'function' then hyphenators = new Map(); hyphenators.set 'en-us', _hyphenators
//   when 'map'      then null
//   else throw new Error "^3464^ unknown hyphenators type #{rpr type}"
// return hyphenators.get 'en-us'
/*

collection of words that are not satisfactorily hyphenated
to be added to an exceptions dictionary

process
su-per-cal-ifrag-ilis-tic

*/

}).call(this);