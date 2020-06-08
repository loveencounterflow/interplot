(function() {
  'use strict';
  var $, $XXX_datoms_from_html, $async, $before_first, $drain, $once_async_before_first, $show, $watch, CND, DATAMILL, DATOM, DEMO, FS, HTML, INTERPLOT, INTERTEXT, PATH, RC, SP, _settings, after, alert, assign, badge, cast, debug, echo, freeze, help, info, isa, join_path, jr, lets, new_datom, progress, provide_interplot_extensions, rpr, select, sleep, stamp, type_of, types, urge, validate, warn, whisper;

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

  ({new_datom, stamp, lets, freeze, select} = DATOM.export());

  //...........................................................................................................
  SP = require('steampipes');

  // SP                        = require '../../apps/steampipes'
  ({$, $async, $drain, $watch, $before_first, $once_async_before_first, $show} = SP.export());

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
  // PUPPETEER                 = require 'puppeteer'
  INTERTEXT = require('intertext');

  ({HTML} = INTERTEXT);

  //...........................................................................................................
  RC = require('../remote-control');

  DATAMILL = {};

  DEMO = {};

  INTERPLOT = {};

  _settings = DATOM.freeze(require('../settings'));

  progress = function(...P) {
    var p;
    return echo(...((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = P.length; i < len; i++) {
        p = P[i];
        results.push(CND.cyan(p));
      }
      return results;
    })()));
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  $XXX_datoms_from_html = function() {
    return $(function(x, send) {
      progress('^P1^', rpr(x));
      if (x === '<p>A concise introduction to the things discussed below.</p>\n') {
        send(freeze({
          $key: '<p'
        }));
        send(freeze({
          $key: '^text',
          text: "(simulated) A concise introduction to the things discussed below."
        }));
        return send(freeze({
          $key: '>p'
        }));
      }
    });
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  INTERTEXT.$append = function(text) {
    validate.text(text);
    return $(function(x, send) {
      send((isa.text(x)) ? x + text : x);
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
    var leapfrog;
    //-----------------------------------------------------------------------------------------------------------
    leapfrog = function(d, send, done) {
      /* NOTE Helper function to slightly simplify quick exit from (async) transforms; used to make up for
      the still missing `{ leapfrog, }` modifier for `$async` transforms. Does very little but helps to mark
      those points where the modifier would have been used. Usage:

      ```coffee
      $t = -> $async ( d, send, done ) =>
        return ( leapfrog d, send, done ) unless select d, '^key-i'm-waiting-for
        ...
      ```
      */
      send(d);
      return done();
    };
    //-----------------------------------------------------------------------------------------------------------
    this.$launch = function(S) {
      /* TAINT settings to be passed in via `S`? */
      var gui, url, wait_for_selector;
      url = 'file:///home/flow/jzr/interplot/public/demo-galley/main.html';
      wait_for_selector = '#page-ready';
      gui = false;
      gui = true;
      //.........................................................................................................
      return $once_async_before_first(async(send, done) => {
        progress('^P2^', "INTERPLOT_extensions.$launch");
        send(new_datom('^interplot:launch-browser'));
        urge("launching browser...");
        S.rc = (await RC.new_remote_control({url, wait_for_selector, gui}));
        urge("browser launched");
        //.....................................................................................................
        /* TAINT how to best expose libraries in browser context? */
        await S.rc.page.exposeFunction('TEMPLATES_slug', (...P) => {
          return (require('../template-elements')).slug(...P);
        });
        await S.rc.page.exposeFunction('TEMPLATES_pointer', (...P) => {
          return (require('../template-elements')).pointer(...P);
        });
        await S.rc.page.evaluate(function() {
          return ($(document)).ready(async function() {
            console.log('^scratch/launch@6745^', 'TEMPLATES_slug()', (await TEMPLATES_slug()));
            return console.log('^scratch/launch@6745^', 'TEMPLATES_pointer()', (await TEMPLATES_pointer()));
          });
        });
        debug('^scratch/$launch@883^', "slug():", (require('../template-elements')).slug);
        debug('^scratch/$launch@883^', "pointer():", (require('../template-elements')).pointer);
        //.....................................................................................................
        send(new_datom('^interplot:browser-ready'));
        return done();
      });
    };
    //-----------------------------------------------------------------------------------------------------------
    this.$find_first_target_element = function(S) {
      return $async(async(d, send, done) => {
        var column_count, opsf, selector;
        if (!select(d, '^interplot:browser-ready')) {
          return leapfrog(d, send, done);
        }
        progress('^P3^', "INTERPLOT_extensions.$find_first_target_element");
        send(d);
        selector = 'column'; // 'column:nth(0)'
        // debug '^22298^', await S.rc.page.$ selector
        // debug '^22298^', await S.rc.page.$ 'column'
        opsf = function(selector)/* NOTE: OPSF = On-Page Script Function */ {
          var ref;
          /* TAINT race condition or can we rely on page ready? */
          // ( $ document ).ready ->
          globalThis.xxx_target_elements = $(selector);
          console.log('^scratch/find_first_target_element@3987^', "xxx_target_elements:", xxx_target_elements[0]);
          return (ref = globalThis.xxx_target_elements) != null ? ref.length : void 0;
        };
        column_count = (await S.rc.page.evaluate(opsf, selector));
        debug('^scratch/find_first_target_element@22298^', `found ${column_count} elements for ${rpr({selector})}`);
        send(new_datom('^interplot:first-target-element', {selector}));
        return done();
      });
    };
    //-----------------------------------------------------------------------------------------------------------
    return this.$text_as_pdf = function(S) {
      var pipeline;
      /*
      * [x] launch browser
      * [ ] establish flow order of target elements (columns) in document
      * [ ] insert `pointer#pointer` DOM element into page
      * [ ] ignore events other than `^slabs` FTTB
      * [ ] determine leftmost, rightmost indexes into slugs that is close to one line worth of text
      * [ ] call OPS method with assembled text to determine metrics of text at insertion point
      * [ ] depending on metrics, accept line, try new one, or accept previous attempt
      * [ ] call OPS method to accept good line and remove other
      * [ ] check metrics whether vertical column limit has been reached; if so, reposition pointer

      NOTE procedure as detailed here may suffer from performance issue due to repeated IPC; might be better
      to preproduce and send more line data to reduce IPC calls. Check for ways that
      `INTERTEXT.SLABS.assemble()` can be made available to OPS.

       */
      validate.nonempty_text(S.target_path);
      //..........................................................................................................
      pipeline = [];
      pipeline.push(this.$launch(S));
      pipeline.push(this.$find_first_target_element(S));
      pipeline.push($watch(function(d) {
        return whisper('^scratch/$text_as_pdf@334', d);
      }));
      //..........................................................................................................
      progress('^P4^', "INTERPLOT_extensions.$text_as_pdf");
      return SP.pull(...pipeline);
    };
  };

  provide_interplot_extensions.apply(INTERPLOT);

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.f = function() {
    return new Promise(async(resolve) => {
      var S, not_a_text, pipeline, source;
      //.........................................................................................................
      process.on('SIGINT', async function() {
        /* Make sure browser is closed gracefully so as to continue in previous state and avoid "do you want to
           restore" dialog. This solution works sometimes but not always. */
        warn("Caught interrupt signal");
        await S.rc.page.close({
          runBeforeUnload: true
        });
        await S.rc.browser.close();
        return process.exit();
      });
      //.........................................................................................................
      S = {
        settings: lets(_settings, function(d) {
          return assign(d, {
            headless: false
          });
        })
      };
      //.........................................................................................................
      S.sample_home = PATH.resolve(PATH.join(__dirname, '../../sample-data'));
      S.source_path = PATH.join(S.sample_home, 'sample-text.html');
      S.target_path = PATH.join(S.sample_home, 'sample-text.pdf');
      pipeline = [];
      // source        = SP.read_from_file S.source_path
      source = (await SP._KLUDGE_file_as_buffers(S.source_path));
      not_a_text = function(d) {
        return !isa.text(d);
      };
      //.........................................................................................................
      pipeline.push(source);
      //.........................................................................................................
      /* TAINT implement `$split()` w/ newline/whitespace-preserving */
      /* ↓↓↓ arbitrarily chunked buffers ↓↓↓ */      pipeline.push(SP.$split());
      /* ↓↓↓ lines of text ↓↓↓ */      pipeline.push(DATAMILL.$stop_on_stop_tag());
      pipeline.push(INTERTEXT.$append('\n'));
      //.........................................................................................................
      pipeline.push($({
        leapfrog: not_a_text
      }, $XXX_datoms_from_html()));
      pipeline.push($watch(function(d) {
        return progress('^P5^', `(pipeline) ${rpr(d)}`);
      }));
      pipeline.push(DEMO.$grab_first_paragraphs());
      pipeline.push(DEMO.$filter_text());
      // pipeline.push DEMO.$consolidate_text()
      pipeline.push(DEMO.$blockify());
      /* ↓↓↓ text/HTML of blocks ↓↓↓ */      pipeline.push(DEMO.$hyphenate());
      pipeline.push(DEMO.$as_slabs());
      //.........................................................................................................
      /* ↓↓↓ slabs ↓↓↓ */      pipeline.push(INTERPLOT.$text_as_pdf(S));
      pipeline.push($show({
        title: '--334-->'
      }));
      //.........................................................................................................
      pipeline.push($drain(() => {
        return resolve();
      }));
      progress('^P6^', "f");
      SP.pull(...pipeline);
      return null;
    });
  };

  //###########################################################################################################
  if (module === require.main) {
    (async() => {
      //.........................................................................................................
      await this.f();
      // settings =
      //   product:          'firefox'
      //   headless:         false
      //   executablePath:   '/usr/bin/firefox'
      // await ( require 'puppeteer' ).launch settings
      return help('ok');
    })();
  }

}).call(this);

//# sourceMappingURL=scratch.js.map