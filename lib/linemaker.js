(function() {
  'use strict';
  var $, $drain, CND, FS, HYPH, PATH, SP, alert, assign, badge, cast, debug, help, info, isa, join_path, jr, provide_hyphenation, rpr, type_of, types, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'INTERPLOT/GENERATE-PDF';

  debug = CND.get_logger('debug', badge);

  alert = CND.get_logger('alert', badge);

  whisper = CND.get_logger('whisper', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  info = CND.get_logger('info', badge);

  PATH = require('path');

  FS = require('fs');

  ({jr} = CND);

  assign = Object.assign;

  join_path = function(...P) {
    return PATH.resolve(PATH.join(...P));
  };

  //...........................................................................................................
  types = require('./types');

  ({isa, validate, cast, type_of} = types);

  SP = require('steampipes');

  ({$, $drain} = SP.export());

  //-----------------------------------------------------------------------------------------------------------
  provide_hyphenation = function() {
    var createHyphenator, hyphenate, patterns;
    createHyphenator = require('hyphen');
    patterns = require('hyphen/patterns/en-us');
    hyphenate = createHyphenator(patterns); //, { hyphenChar: '-', }
    
    //-----------------------------------------------------------------------------------------------------------
    return this.hyphenate = function(text) {
      return hyphenate(text);
    };
  };

  provide_hyphenation.apply(HYPH = {});

  // #-----------------------------------------------------------------------------------------------------------
  // @hyphenate_2 = ( text ) ->
  //   { hyphenated, } = require 'hyphenated'
  //   R               = hyphenated text
  //   return R.replace /\u00ad/g, '-'

  // #-----------------------------------------------------------------------------------------------------------
  // xxx = null
  // @hyphenate_3 = ( text ) ->
  //   hyphenopoly = require 'hyphenopoly'
  //   hyphenator  = hyphenopoly.config {
  //       require:    [ 'de', 'en-us', ]
  //       hyphen:     '-',
  //       exceptions: { 'en-us': 'en-han-ces', }
  //   hyphenate = await hyphenator.get 'en-us'
  //   async function hyphenate_en(text) {
  //       console.log(hyphenateText(text));
  //   }

  //-----------------------------------------------------------------------------------------------------------
  this.demo_hyphenation = function() {
    var htext, i, len, text, texts;
    texts = ["typesetting", "supercalifragilistic", "phototypesetter", "hairstylist", "gargantuan", "the lopsided honeybadger"];
    for (i = 0, len = texts.length; i < len; i++) {
      text = texts[i];
      htext = HYPH.hyphenate(text);
      htext = htext.replace(/\u00ad/g, '-');
      info(htext);
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.demo_compare_hyphenators = function() {
    return new Promise((done) => {
      var count1, count2, pipeline;
      count1 = 0;
      count2 = 0;
      pipeline = [];
      pipeline.push(SP.read_from_file('/etc/dictionaries-common/words'));
      pipeline.push(SP.$split());
      pipeline.push(SP.$filter(function(word) {
        return word.length > 0;
      }));
      pipeline.push(SP.$watch((word) => {
        var t1, t2;
        t1 = this.hyphenate_1(word);
        t2 = this.hyphenate_2(word);
        if (t1 === t2) {
          return;
        }
        count1 += (t1.replace(/[^-]/g, '')).length;
        count2 += (t2.replace(/[^-]/g, '')).length;
        return info(CND.lime(t1), CND.gold(t2));
      }));
      // pipeline.push SP.$show()
      pipeline.push($drain(function() {
        info(CND.lime(count1), CND.gold(count2));
        return done();
      }));
      SP.pull(...pipeline);
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.demo_linebreak = function() {
    var LineBreaker, breaker, keep_hyphen, last, lbo, nbsp, rq, shy, text, word, xhy;
    LineBreaker = require('linebreak');
    keep_hyphen = String.fromCodePoint(0x2011);
    shy = String.fromCodePoint(0x00ad);
    nbsp = String.fromCodePoint(0x00a0);
    text = `Super-cali${keep_hyphen}frag${shy}i${shy}lis${shy}tic\nis a won${shy}der${shy}ful word我很喜歡這個單字。`;
    breaker = new LineBreaker(text);
    last = 0;
    /* LBO: line break opportunity */
    while ((lbo = breaker.nextBreak()) != null) {
      // get the string between the last break and this one
      word = text.slice(last, lbo.position);
      xhy = isa.interplot_shy(word) ? CND.gold('-') : '';
      rq = lbo.required ? '!' : ' ';
      word = word.trimEnd();
      info(rq, jr(word), xhy);
      last = lbo.position;
    }
    return null;
  };

  //###########################################################################################################
  if (module === require.main) {
    (() => {
      // @demo_linebreak()
      return this.demo_hyphenation();
    })();
  }

}).call(this);
