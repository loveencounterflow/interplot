(function() {
  'use strict';
  var $, $async, $drain, $show, $watch, CND, DATAMILL, DATOM, DEMO, FS, HTML, INTERPLOT, INTERTEXT, LINEMAKER, PATH, RC, SP, _settings, after, alert, assign, badge, cast, debug, echo, help, info, isa, join_path, jr, lets, new_datom, provide_interplot_extensions, rpr, select, sleep, stamp, type_of, types, urge, validate, warn, whisper;

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

  ({new_datom, stamp, lets, select} = DATOM.export());

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

  //...........................................................................................................
  RC = require('../remote-control');

  DATAMILL = {};

  DEMO = {};

  INTERPLOT = {};

  _settings = DATOM.freeze(require('../settings'));

  //===========================================================================================================

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

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  INTERTEXT.$as_lines = function(settings) {
    /* TAINT implement settings to configure what to do if data is not text */
    return $(function(x, send) {
      send((isa.text(x)) ? x + '\n' : x);
      return null;
    });
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
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

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  DEMO.$grab_first_paragraphs = function() {
    var p_count, within_p;
    p_count = 0;
    within_p = false;
    return $((d, send) => {
      if (p_count >= 2) {
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

  // #-----------------------------------------------------------------------------------------------------------
  // DEMO.$consolidate_text = ->
  //   ### TAINT use SP.$collect() ?? ###
  //   last      = Symbol 'last'
  //   collector = []
  //   return $ { last, }, ( d, send ) =>
  //     return send collector.join '' if d is last
  //     validate.text d
  //     collector.push d

  //-----------------------------------------------------------------------------------------------------------
  DEMO.$blockify = function() {
    var collector, last;
    last = Symbol('last');
    collector = [];
    return $({last}, (d, send) => {
      var text;
      if (d === last) {
        text = collector.join('');
        return send(new_datom('^mkts:block', {text}));
      }
      validate.text(d);
      return collector.push(d);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  DEMO.$hyphenate = function() {
    return $((d, send) => {
      if (!select(d, '^mkts:block')) {
        return send(d);
      }
      return send(lets(d, (d) => {
        return d.text = INTERTEXT.HYPH.hyphenate(d.text);
      }));
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  DEMO.$as_slabs = function() {
    return $((d, send) => {
      if (!select(d, '^mkts:block')) {
        return send(d);
      }
      send(stamp(d));
      return send(new_datom('^slabs', INTERTEXT.SLABS.slabs_from_text(d.text)));
    });
  };

  // send lets d, ( d ) => d.text = INTERTEXT.hyphenate d.text

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  provide_interplot_extensions = function() {
    //-----------------------------------------------------------------------------------------------------------
    this.$launch = function(S) {
      var gui, has_launched, url, wait_for_selector;
      has_launched = false;
      url = 'file:///home/flow/jzr/interplot/public/demo-galley/main.html';
      wait_for_selector = '#page-ready';
      gui = true;
      //.........................................................................................................
      return $async(async(d, send, done) => {
        send(stamp(d));
        if (!has_launched) {
          urge("launching browser...");
          S.rc = (await RC.new_remote_control({url, wait_for_selector, gui}));
          //.....................................................................................................
          /* TAINT how to best expose libraries in browser context? */
          await S.rc.page.exposeFunction('TEMPLATES_slug', (...P) => {
            return (require('../templates')).slug(...P);
          });
          await S.rc.page.exposeFunction('TEMPLATES_pointer', (...P) => {
            return (require('../templates')).pointer(...P);
          });
          //.....................................................................................................
          urge("browser launched");
        }
        return done();
      });
    };
    //-----------------------------------------------------------------------------------------------------------
    this.$f = function(settings) {
      /* TAINT how to avoid repeated validation of settings? */
      return $async((d, send, done) => {
        //.......................................................................................................
        // help "^3342^ output written to #{settings.path}"
        send(stamp(d));
        return done();
      });
    };
    //-----------------------------------------------------------------------------------------------------------
    this.$text_as_pdf = function(S) {
      var pipeline;
      validate.nonempty_text(S.target_path);
      //..........................................................................................................
      pipeline = [];
      pipeline.push(this.$launch(S));
      pipeline.push(this.$f());
      //..........................................................................................................
      return SP.pull(...pipeline);
    };
    //-----------------------------------------------------------------------------------------------------------
    /* TAINT put into browser interface module */
    return this.get_page = async function(browser) {
      var R, pages;
      if (isa.empty((pages = (await browser.pages())))) {
        urge("µ29923-2 new page");
        R = (await browser.newPage());
      } else {
        urge("µ29923-2 use existing page");
        R = pages[0];
      }
      return R;
    };
  };

  provide_interplot_extensions.apply(INTERPLOT);

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.f = function() {
    return new Promise((resolve) => {
      var S, not_a_text, pipeline, source;
      S = {
        settings: lets(_settings, function(d) {
          return assign(d, {
            headless: false
          });
        }),
        browser: null,
        page: null
      };
      //.........................................................................................................
      S.sample_home = PATH.resolve(PATH.join(__dirname, '../../sample-data'));
      S.source_path = PATH.join(S.sample_home, 'sample-text.html');
      S.target_path = PATH.join(S.sample_home, 'sample-text.pdf');
      pipeline = [];
      source = SP.read_from_file(S.source_path);
      not_a_text = function(d) {
        return !isa.text(d);
      };
      //.........................................................................................................
      pipeline.push(source);
      /* TAINT implement `$split()` w/ newline/whitespace-preserving */
      //.........................................................................................................
      /* ↓↓↓ arbitrarily chunked buffers ↓↓↓ */      pipeline.push(SP.$split());
      /* ↓↓↓ lines of text ↓↓↓ */      pipeline.push(INTERTEXT.$as_lines());
      pipeline.push(DATAMILL.$stop_on_stop_tag());
      //.........................................................................................................
      pipeline.push($({
        leapfrog: not_a_text
      }, HTML.$html_as_datoms()));
      pipeline.push(DEMO.$grab_first_paragraphs());
      pipeline.push(DEMO.$filter_text());
      // pipeline.push DEMO.$consolidate_text()
      pipeline.push(DEMO.$blockify());
      /* ↓↓↓ text/HTML of blocks ↓↓↓ */      pipeline.push(DEMO.$hyphenate());
      pipeline.push(DEMO.$as_slabs());
      //.........................................................................................................
      // pipeline.push INTERPLOT.$text_as_pdf S
      /* ↓↓↓ slabs ↓↓↓ */      pipeline.push($show());
      //.........................................................................................................
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
