(function() {
  'use strict';
  var $, $async, $drain, $show, $watch, CND, DATAMILL, DATOM, DEMO, FS, HTML, INTERTEXT, LINEMAKER, PATH, SP, after, alert, assign, badge, cast, debug, echo, help, info, isa, join_path, jr, lets, new_datom, rpr, select, sleep, type_of, types, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'INTERPLOT/SCRATCH';

  debug = CND.get_logger('debug', badge);

  alert = CND.get_logger('alert', badge);

  whisper = CND.get_logger('whisper', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  info = CND.get_logger('info', badge);

  echo = CND.echo.bind(CND);

  PATH = require('path');

  FS = require('fs');

  ({jr} = CND);

  assign = Object.assign;

  join_path = function(...P) {
    return PATH.resolve(PATH.join(...P));
  };

  //...........................................................................................................
  types = require('../types');

  ({isa, validate, cast, type_of} = types);

  //...........................................................................................................
  // DATOM                     = new ( require 'datom' ).Datom { dirty: false, }
  DATOM = require('datom');

  ({new_datom, lets, select} = DATOM.export());

  //...........................................................................................................
  SP = require('steampipes');

  // SP                        = require '../../apps/steampipes'
  ({$, $async, $drain, $watch, $show} = SP.export());

  //...........................................................................................................
  after = function(dts, f) {
    return setTimeout(f, dts * 1000);
  };

  sleep = function(dts) {
    return new Promise(function(done) {
      return after(dts, done);
    });
  };

  // page_html_path            = PATH.resolve PATH.join __dirname, '../../../public/main.html'
  LINEMAKER = require('../linemaker');

  // PUPPETEER                 = require 'puppeteer'
  INTERTEXT = require('intertext');

  ({HTML} = INTERTEXT);

  //-----------------------------------------------------------------------------------------------------------
  HTML.$html_as_datoms = function() {
    return $((buffer_or_text, send) => {
      var d, i, len, ref;
      ref = HTML.html_as_datoms(buffer_or_text);
      for (i = 0, len = ref.length; i < len; i++) {
        d = ref[i];
        send(d);
      }
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  INTERTEXT.$as_lines = function(settings) {
    /* TAINT implement settings to configure what to do if data is not text */
    return $(function(x, send) {
      send((isa.text(x)) ? x + '\n' : x);
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  DATAMILL = {};

  DATAMILL.$stop_on_stop_tag = function() {
    var has_stopped, line_nr;
    has_stopped = false;
    line_nr = 0;
    return $((line, send) => {
      if (has_stopped) {
        return;
      }
      line_nr++;
      if (/^\s*<stop\/>/.test(line)) {
        has_stopped = true;
        send(new_datom('^stop', {
          $: {line_nr}
        }));
        return send.end();
      }
      return send(line);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  DEMO = {};

  //-----------------------------------------------------------------------------------------------------------
  DEMO.$grab_first_paragraph = function() {
    var p_count, within_p;
    p_count = 0;
    within_p = false;
    return $((d, send) => {
      if (p_count >= 1) {
        return send.end();
      }
      switch (d.$key) {
        case '<p':
          within_p = true;
          send(d);
          break;
        case '>p':
          within_p = false;
          p_count++;
          send(d);
          break;
        default:
          if (within_p) {
            return send(d);
          }
      }
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  DEMO.$filter_text = function() {
    return $((d, send) => {
      if (!select(d, '^text')) {
        return;
      }
      return send(d.text);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  DEMO.$consolidate_text = function() {
    /* TAINT use SP.$collect() ?? */
    var collector, last;
    last = Symbol('last');
    collector = [];
    return $({last}, (d, send) => {
      if (d === last) {
        return send(collector.join(''));
      }
      validate.text(d);
      return collector.push(d);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.f = function() {
    return new Promise((resolve) => {
      var not_a_text, pipeline, source, source_path;
      source_path = PATH.resolve(PATH.join(__dirname, '../../sample-data/sample-text.html'));
      pipeline = [];
      source = SP.read_from_file(source_path);
      not_a_text = function(d) {
        return !isa.text(d);
      };
      pipeline.push(source);
      pipeline.push(SP.$split());
      /* TAINT implement `$split()` w/ newline/whitespace-preserving */      pipeline.push(INTERTEXT.$as_lines());
      pipeline.push(DATAMILL.$stop_on_stop_tag());
      pipeline.push($({
        leapfrog: not_a_text
      }, HTML.$html_as_datoms()));
      pipeline.push(DEMO.$grab_first_paragraph());
      pipeline.push(DEMO.$filter_text());
      pipeline.push(DEMO.$consolidate_text());
      pipeline.push($show());
      pipeline.push($drain(() => {
        return resolve();
      }));
      SP.pull(...pipeline);
      return null;
    });
  };

  //###########################################################################################################
  if (module === require.main) {
    (async() => {
      await this.f();
      return help('ok');
    })();
  }

}).call(this);
