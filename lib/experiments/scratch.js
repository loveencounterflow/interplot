(function() {
  'use strict';
  var $, $async, $drain, $once_async_before_first, $once_before_first, $show, $watch, CND, DATAMILL, DATOM, DEMO, FS, HTML, INTERPLOT, INTERTEXT, PATH, RC, SP, _settings, after, alert, assign, badge, cast, debug, echo, help, info, isa, join_path, jr, lets, new_datom, provide_interplot_extensions, rpr, select, sleep, stamp, type_of, types, urge, validate, warn, whisper;

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
  ({$, $async, $drain, $watch, $once_before_first, $once_async_before_first, $show} = SP.export());

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

  HTML = require('paragate/lib/htmlish.grammar');

  //...........................................................................................................
  RC = require('../remote-control');

  DATAMILL = {};

  DEMO = {};

  INTERPLOT = {};

  _settings = DATOM.freeze(require('../settings'));

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
  DEMO.$grab_first_paragraphs = function(n = 2) {
    var p_count, within_p;
    p_count = 0;
    within_p = false;
    return $((d, send) => {
      if (p_count >= n) {
        return;
      }
      if ((d.$key === '<tag') && (d.name === 'p')) {
        within_p = true;
        send(d);
      } else if ((d.$key === '>tag') && (d.name === 'p')) {
        within_p = false;
        p_count++;
        send(d);
      } else {
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

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT use OPS proxy or `require` OPS into this context */
  DEMO.OPS_slugs_with_metrics_from_slabs = async function(page, ...P) {
    return (await page.evaluate((function(...P) {
      return OPS.slugs_with_metrics_from_slabs(...P);
    }), ...P));
  };

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
      gui = true;
      //.........................................................................................................
      return $once_async_before_first(async(send, done) => {
        send(new_datom('^interplot:launch-browser'));
        urge("launching browser...");
        S.rc = (await RC.new_remote_control({url, wait_for_selector, gui}));
        urge("browser launched");
        //.....................................................................................................
        /* TAINT how to best expose libraries in browser context? */
        await S.rc.page.exposeFunction('TEMPLATES_slug_as_html', (...P) => {
          return (require('../templates')).slug_as_html(...P);
        });
        //.....................................................................................................
        send(new_datom('^interplot:browser-ready'));
        return done();
      });
    };
    //-----------------------------------------------------------------------------------------------------------
    this.$find_first_target_element = function(S) {
      return $async((d, send, done) => {
        var selector;
        if (!select(d, '^interplot:browser-ready')) {
          return leapfrog(d, send, done);
        }
        send(d);
        selector = 'column:first'; // 'column:nth(0)'
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
      pipeline.push($async(async function(d, send, done) {
        var XXX_settings, slugs_with_metrics;
        switch (d.$key) {
          case '^text':
            help(rpr(d.text));
            send(d);
            break;
          case '^slabs':
            validate.interplot_slabs_datom(d);
            urge(rpr(d.slabs));
            XXX_settings = {
              min_slab_idx: 0
            };
            debug(slugs_with_metrics = (await DEMO.OPS_slugs_with_metrics_from_slabs(S.rc.page, d, XXX_settings)));
            break;
          default:
            send(d);
        }
        return done();
      }));
      pipeline.push($watch(function(d) {
        return urge('^88767^', rpr(d));
      }));
      //..........................................................................................................
      return SP.pull(...pipeline);
    };
  };

  provide_interplot_extensions.apply(INTERPLOT);

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.f = function() {
    return new Promise(async(resolve) => {
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
      }, HTML.$parse()));
      pipeline.push(DEMO.$grab_first_paragraphs(6));
      pipeline.push(DEMO.$filter_text());
      // pipeline.push DEMO.$consolidate_text()
      pipeline.push(DEMO.$blockify());
      /* ↓↓↓ text/HTML of blocks ↓↓↓ */      pipeline.push(DEMO.$hyphenate());
      pipeline.push(DEMO.$as_slabs());
      //.........................................................................................................
      /* ↓↓↓ slabs ↓↓↓ */      pipeline.push(INTERPLOT.$text_as_pdf(S));
      pipeline.push($show());
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

//# sourceMappingURL=scratch.js.map