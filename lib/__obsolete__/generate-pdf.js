(function() {
  'use strict';
  var CND, FS, LINEMAKER, OPS_slugs_with_metrics_from_slabs, PATH, PUPPETEER, _devtools_node_from_selector, _format, _prv_console_warning, _raw_font_stats_from_selector, after, alert, assign, badge, cache, cast, computed_styles_from_selector, debug, demo_2, demo_insert_slabs, echo, echo_browser_console, equals, format_as_percentage, format_float, format_integer, get_all_selectors, get_base_style, get_page, get_ppt_doc_object, help, info, isa, join_path, jr, mark_elements_with_fallback_glyphs, page_html_path, profile, rpr, selectors_from_display_value, settings, show_global_font_stats, sleep, styles_from_nodeid, styles_from_selector, take_screenshot, type_of, types, urge, validate, warn, whisper,
    indexOf = [].indexOf;

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

  echo = CND.echo.bind(CND);

  PATH = require('path');

  FS = require('fs');

  ({jr} = CND);

  assign = Object.assign;

  join_path = function(...P) {
    return PATH.resolve(PATH.join(...P));
  };

  //...........................................................................................................
  /* TAINT implement in InterText */
  _format = require('number-format.js');

  format_float = function(x) {
    return _format('#,##0.000', x);
  };

  format_integer = function(x) {
    return _format('#,##0.', x);
  };

  format_as_percentage = function(x) {
    return _format('#,##0.00', x * 100);
  };

  //...........................................................................................................
  types = require('../types');

  ({isa, validate, cast, equals, type_of} = types);

  //...........................................................................................................
  after = function(dts, f) {
    return setTimeout(f, dts * 1000);
  };

  sleep = function(dts) {
    return new Promise(function(done) {
      return after(dts, done);
    });
  };

  page_html_path = PATH.resolve(PATH.join(__dirname, '../../../public/main.html'));

  LINEMAKER = require('../linemaker');

  PUPPETEER = require('puppeteer');

  //...........................................................................................................
  cache = {};

  settings = require('../settings');

  //-----------------------------------------------------------------------------------------------------------
  _prv_console_warning = null;

  echo_browser_console = (c) => {
    /* OK */
    var linenr, location, match, path, ref, ref1, ref2, ref3, ref4, ref5, ref6, short_path, text;
    linenr = (ref = (ref1 = c._location) != null ? ref1.lineNumber : void 0) != null ? ref : '?';
    path = (ref2 = (ref3 = c._location) != null ? ref3.url : void 0) != null ? ref2 : '???';
    short_path = path;
    if ((match = path.match(/^file:\/\/(?<path>.+)$/)) != null) {
      short_path = PATH.relative(process.cwd(), PATH.resolve(FS.realpathSync(match.groups.path)));
    }
    if (!short_path.startsWith('../')) {
      path = short_path;
    }
    location = `${path}:${linenr}`;
    text = (ref4 = c._text) != null ? ref4 : '???';
    // whisper '^33489^', ( types.all_keys_of c ).sort().join ' ' # [ .. 100 ]
    // whisper '^33489^', ( types.all_keys_of c.valueOf() ).sort().join ' ' # [ .. 100 ]
    // whisper '^33489^', typeof c
    // whisper '^33489^', typeof c.valueOf()
    // debug c.valueOf().jsonValue
    //.........................................................................................................
    if (c._type === 'error') {
      settings.has_error = true;
      warn(`${location}:`, text);
      if ((ref5 = (ref6 = settings.close) != null ? ref6.on_error : void 0) != null ? ref5 : false) {
        after(3, () => {
          return process.exit(1);
        });
      }
    } else {
      // throw new Error text
      //.........................................................................................................
      if (c._type === 'warning') {
        if (text === _prv_console_warning) {
          return;
        }
        _prv_console_warning = text;
      } else {
        _prv_console_warning = null;
      }
      whisper(`^44598^ ${c._type} ${location}:`, text);
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  get_page = async function(browser) {
    var R, pages;
    /* OK */
    if (isa.empty((pages = (await browser.pages())))) {
      urge("µ29923-2 new page");
      R = (await browser.newPage());
    } else {
      urge("µ29923-2 use existing page");
      R = pages[0];
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  take_screenshot = async function(page) {
    var chart_dom, target_selector;
    urge("µ29923-6 take screenshot");
    //.........................................................................................................
    if (settings.screenshot.puppeteer.fullPage) {
      await page.screenshot(settings.screenshot.puppeteer);
    } else {
      //.......................................................................................................
      //.........................................................................................................
      urge("µ29923-5 page goto");
      target_selector = settings.screenshot.target_selector;
      chart_dom = (await page.$(target_selector));
      //.......................................................................................................
      if (chart_dom == null) {
        warn(`unable to take screenshot: DOM element ${rpr(target_selector)} not found`);
        return null;
      }
      //.......................................................................................................
      urge("µ29923-6 take screenshot");
      await chart_dom.screenshot(settings.screenshot.puppeteer);
    }
    //.........................................................................................................
    help(`output written to ${PATH.relative(process.cwd(), settings.screenshot.puppeteer.path)}`);
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  _devtools_node_from_selector = async function(page, doc, selector) {
    /* TAINT how are 'devtools nodes' different from DOM nodes? */
    return (await page._client.send('DOM.querySelector', {
      nodeId: doc.root.nodeId,
      selector
    }));
  };

  //-----------------------------------------------------------------------------------------------------------
  _raw_font_stats_from_selector = async function(page, doc, selector) {
    /* see https://chromedevtools.github.io/devtools-protocol/tot/CSS#method-getPlatformFontsForNode */
    var description, node;
    node = (await _devtools_node_from_selector(page, doc, selector));
    description = (await page._client.send('CSS.getPlatformFontsForNode', {
      nodeId: node.nodeId
    }));
    return description.fonts;
  };

  //-----------------------------------------------------------------------------------------------------------
  get_ppt_doc_object = async function(page) {
    var R;
    if ((R = cache.ppt_doc_object) != null) {
      return R;
    }
    await page._client.send('DOM.enable');
    await page._client.send('CSS.enable');
    R = cache.ppt_doc_object = (await page._client.send('DOM.getDocument'));
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  get_base_style = async function(page) {
    var R;
    if ((R = cache.base_style) != null) {
      /* NOTE observe that due to caching, page base style may not be up-to-date after page styles changed */
      return R;
    }
    return cache.base_style = (await page.evaluate(function() {
      var i, key, len, style_obj;
      style_obj = window.getComputedStyle(document.querySelector('unstyledelement'));
      R = {};
// for idx in [ 0 ... style_obj.length ]
//   key       = style_obj[ idx ]
//   R[ key ]  = style_obj.getPropertyValue key
/* NOTE iterate as if object were a list, use API method with key instead of bracket syntax: */
      for (i = 0, len = style_obj.length; i < len; i++) {
        key = style_obj[i];
        R[key] = style_obj.getPropertyValue(key);
      }
      return R;
    }));
  };

  //-----------------------------------------------------------------------------------------------------------
  selectors_from_display_value = async function(page, display_value) {
    return (await page.evaluate(function() {
      var all_nodes, block_nodes, d;
      all_nodes = Array.from(document.querySelectorAll('body *'));
      block_nodes = all_nodes.filter(function(d) {
        return (window.getComputedStyle(d)).display === 'block';
      });
      return (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = block_nodes.length; i < len; i++) {
          d = block_nodes[i];
          results.push(selector_of(d));
        }
        return results;
      })();
    }));
  };

  //-----------------------------------------------------------------------------------------------------------
  get_all_selectors = async function(page) {
    return (await page.evaluate(function() {
      var all_nodes, d;
      all_nodes = Array.from(document.querySelectorAll('body *'));
      return (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = all_nodes.length; i < len; i++) {
          d = all_nodes[i];
          results.push(selector_of(d));
        }
        return results;
      })();
    }));
  };

  //-----------------------------------------------------------------------------------------------------------
  computed_styles_from_selector = async function(page, selector) {
    var base_style, styles;
    styles = (await styles_from_selector(page, 'slug'));
    debug('^33334^', styles);
    base_style = (await get_base_style(page));
    return {...base_style, ...styles.verdicts};
  };

  //-----------------------------------------------------------------------------------------------------------
  styles_from_selector = async function(page, selector) {
    var doc, node;
    doc = (await get_ppt_doc_object(page));
    node = (await _devtools_node_from_selector(page, doc, selector));
    // debug '^33334^', jr description = await page._client.send 'DOM.describeNode', { nodeId: node.nodeId, }
    return styles_from_nodeid(page, node.nodeId);
  };

  //-----------------------------------------------------------------------------------------------------------
  styles_from_nodeid = async function(page, nodeid) {
    var R, d, description, doc, first_colnr, first_linenr, i, j, last_colnr, last_linenr, len, len1, location, locations, property, range, ref, ref1, rules, rulesets, sheet, sheets, shorthand_entry_names, stylesheet;
    sheets = [];
    locations = [];
    rulesets = [];
    R = {sheets, locations, rulesets};
    doc = (await get_ppt_doc_object(page));
    description = (await page._client.send('CSS.getMatchedStylesForNode', {
      nodeId: nodeid
    }));
    ref = description.matchedCSSRules;
    //.........................................................................................................
    for (i = 0, len = ref.length; i < len; i++) {
      stylesheet = ref[i];
      sheet = {
        styleSheetId: stylesheet.rule.styleSheetId
      };
      rules = {};
      shorthand_entry_names = new Set((function() {
        var j, len1, ref1, results;
        ref1 = stylesheet.rule.style.shorthandEntries;
        results = [];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          d = ref1[j];
          results.push(d.name);
        }
        return results;
      })());
      //.......................................................................................................
      if ((range = stylesheet.rule.style.range) != null) {
        // debug '^33378^', range
        first_linenr = range.startLine + 1;
        first_colnr = range.startColumn + 1;
        last_linenr = range.endLine + 1;
        last_colnr = range.startColumn + 1;
        location = {
          first: {
            linenr: first_linenr,
            colnr: first_colnr
          },
          last: {
            linenr: last_linenr,
            colnr: last_colnr
          }
        };
      } else {
        //.......................................................................................................
        location = null;
      }
      //.......................................................................................................
      sheets.push(sheet);
      rulesets.push(rules);
      locations.push(location);
      ref1 = stylesheet.rule.style.cssProperties;
      //.......................................................................................................
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        property = ref1[j];
        if (shorthand_entry_names.has(property.name)) {
          continue;
        }
        rules[property.name] = property.value;
      }
    }
    //.........................................................................................................
    R.verdicts = Object.assign({}, ...R.rulesets);
    // for key, value of R.verdicts
    //   delete R.verdicts[ key ] if value is 'initial'
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  mark_elements_with_fallback_glyphs = async function(page) {
    /* TAINT could conceivably be faster because we first retrieve block nodes from the DOM, then try to find
     a selector string for each node, then pass each selector back in to retrieve the respective node again */
    var R, count_txt, doc, font, font_name_txt, i, j, len, len1, raw_font_stats, ref, selector, selector_txt, selectors;
    R = [];
    selectors = (await get_all_selectors(page));
    doc = (await get_ppt_doc_object(page));
    //.........................................................................................................
    echo(CND.grey("—".repeat(108)));
    echo(CND.steel("Missing Glyphs per Element:"));
//.........................................................................................................
    for (i = 0, len = selectors.length; i < len; i++) {
      selector = selectors[i];
      selector_txt = CND.gold(selector.padEnd(50));
      raw_font_stats = (await _raw_font_stats_from_selector(page, doc, selector));
      for (j = 0, len1 = raw_font_stats.length; j < len1; j++) {
        font = raw_font_stats[j];
        if (ref = font.familyName, indexOf.call(settings.fallback_font_names, ref) < 0) {
          continue;
        }
        font_name_txt = CND.lime(font.familyName.padEnd(50));
        count_txt = CND.white((format_integer(font.glyphCount)).padStart(5));
        echo(font_name_txt, count_txt, selector_txt);
        R.push(selector);
        await page.evaluate((function(selector) {
          return µ.DOM.add_class(µ.DOM.select(selector), 'has-fallback-glyphs');
        }), selector);
      }
    }
    //.........................................................................................................
    echo(CND.grey("—".repeat(108)));
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  show_global_font_stats = async function(page) {
    /* thx to https://stackoverflow.com/a/47914111/7568091 */
    /* TAINT unfortunately these stats are not quite reliable and appear to hinge on quite particular
     circumstances, such that font statistics for a given element may or may not include the stats for
     contained elements. Until a better method has been found, the only reliable way to catch all missing
     glyphs is to query *all* DOM nodes. FTTB we look into the `<artboard/>` element. */
    var R, d, doc, fallbacks, font, font_name, font_name_txt, glyph_count, glyph_count_txt, glyph_total, i, len, percentage_txt, raw_font_stats, selectors;
    doc = (await get_ppt_doc_object(page));
    raw_font_stats = (await _raw_font_stats_from_selector(page, doc, 'artboard'));
    R = [];
    glyph_total = raw_font_stats.reduce((function(acc, d) {
      return acc + d.glyphCount;
    }), 0);
    raw_font_stats.sort(function(a, b) {
      return -(a.glyphCount - b.glyphCount);
    });
    fallbacks = [];
    echo(CND.grey("—".repeat(108)));
    echo(CND.grey("^interplot/show_global_font_stats@55432^"));
    echo(CND.steel("Global Font Statistics:"));
    for (i = 0, len = raw_font_stats.length; i < len; i++) {
      font = raw_font_stats[i];
      ({
        familyName: font_name,
        glyphCount: glyph_count
      } = font);
      font_name_txt = CND.lime((jr(font_name)).padEnd(40));
      glyph_count_txt = CND.white((format_integer(glyph_count)).padStart(15));
      percentage_txt = CND.gold((format_as_percentage(glyph_count / glyph_total)).padStart(10));
      echo(font_name_txt, glyph_count_txt, percentage_txt);
      d = {font_name, glyph_count};
      if (indexOf.call(settings.fallback_font_names, font_name) >= 0) {
        fallbacks.push(font_name);
      }
      R.push(d);
    }
    //.........................................................................................................
    // unless isa.empty fallbacks
    if (!isa.empty(selectors = (await mark_elements_with_fallback_glyphs(page)))) {
      echo(CND.red(CND.reverse(CND.bold(` Fallback fonts detected: ${fallbacks.join(', ')} `))));
      echo(CND.red(`in DOM nodes: ${((function() {
        var j, len1, results;
        results = [];
        for (j = 0, len1 = selectors.length; j < len1; j++) {
          d = selectors[j];
          results.push(jr(d));
        }
        return results;
      })()).join(', ')} `));
    }
    //.........................................................................................................
    echo(CND.grey("—".repeat(108)));
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  profile = async function(page, f) {
    await page.tracing.start({
      path: '.cache/trace.json'
    });
    await f();
    return (await page.tracing.stop());
  };

  //-----------------------------------------------------------------------------------------------------------
  demo_2 = async function() {
    /* TAINT get path from configuration? */
    var URL, browser, browser_settings, computed_style, page, path, pdf, ref, ref1, target_selector, url;
    URL = require('url');
    path = PATH.resolve(PATH.join(__dirname, '../../public/demo-galley/main.html'));
    url = (URL.pathToFileURL(path)).href;
    target_selector = '#page-ready';
    //.........................................................................................................
    // Set up browser and page.
    urge("launching browser");
    browser_settings = settings[(ref = settings.use_profile) != null ? ref : 'puppeteer'];
    browser = (await PUPPETEER.launch(browser_settings));
    page = (await get_page(browser));
    //.........................................................................................................
    page.on('error', (error) => {
      throw error;
    });
    page.on('console', echo_browser_console);
    //.........................................................................................................
    // media = 'print'                                       ### OK ###
    // urge "emulate media: #{rpr media}"
    // debug '^4432^', await page.evaluate -> ( matchMedia 'print' ).matches
    // await page.emulateMediaType media
    // debug '^4432^', await page.evaluate -> ( matchMedia 'print' ).matches
    // await page._client.send 'Emulation.clearDeviceMetricsOverride'
    // # await page.emulateMedia null
    // # page.setViewport settings.viewport
    // # await page.emulate PUPPETEER.devices[ 'iPhone 6' ]
    // # await page.emulate PUPPETEER.devices[ 'Galaxy Note 3 landscape' ]
    //.........................................................................................................
    urge(`goto ${url}`);
    await page.goto(url);
    //.........................................................................................................
    urge("waitForSelector");
    await page.waitForSelector(target_selector);
    // #.........................................................................................................
    await page.exposeFunction('TEMPLATES_slug_as_html', (...P) => {
      return (require('../templates')).slug_as_html(...P);
    });
    // await page.exposeFunction 'TEMPLATES_pointer',  ( P... ) => ( require '../templates' ).pointer  P...
    //.........................................................................................................
    // await profile page, -> await demo_insert_slabs page
    await demo_insert_slabs(page);
    //.........................................................................................................
    computed_style = (await computed_styles_from_selector(page, 'slug'));
    // info '^8887^', jr styles.verdicts
    urge('^8887^', "border-left-color:    ", computed_style['border-left-color']);
    urge('^8887^', "outline-width:        ", computed_style['outline-width']);
    urge('^8887^', "background-color:     ", computed_style['background-color']);
    urge('^8887^', "background-repeat-x:  ", computed_style['background-repeat-x']);
    urge('^8887^', "foo:                  ", computed_style['foo']);
    urge('^8887^', "dang:                 ", computed_style['dang']);
    //.........................................................................................................
    await show_global_font_stats(page);
    //.........................................................................................................
    if (settings.puppeteer.headless) {
      urge("write PDF");
      pdf = (await page.pdf(settings.pdf));
      path = '/tmp/test.pdf';
      (require('fs')).writeFileSync(path, pdf);
      info(`ouput written to ${path}`);
    }
    if ((typeof settings.close === "function" ? settings.close(typeof auto !== "undefined" && auto !== null ? auto : false) : void 0) && ((ref1 = !settings.has_error) != null ? ref1 : false)) {
      urge("close");
      await browser.close();
    }
    //.........................................................................................................
    urge("done");
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT use OPS proxy or `require` OPS into this context */
  OPS_slugs_with_metrics_from_slabs = async function(page, ...P) {
    return (await page.evaluate((function(...P) {
      return OPS.slugs_with_metrics_from_slabs(...P);
    }), ...P));
  };

  //-----------------------------------------------------------------------------------------------------------
  demo_insert_slabs = async function(page) {
    var XXX_settings, dt, slabs_dtm, slugs_with_metrics, t0, text;
    text = (require('./sample-texts'))[7];
    text = (text + ' ').repeat(1);
    slabs_dtm = LINEMAKER.slabs_from_text(text);
    validate.interplot_slabs_datom(slabs_dtm);
    // html    = await page.evaluate ( ( slabs_dtm ) -> OPS.demo_insert_slabs slabs_dtm ), slabs_dtm
    XXX_settings = {
      min_slab_idx: 0
    };
    t0 = Date.now();
    slugs_with_metrics = (await OPS_slugs_with_metrics_from_slabs(page, slabs_dtm, XXX_settings));
    dt = Date.now() - t0;
    // for d in slugs_with_metrics
    //   info '^53566^', "slugs_with_metrics", jr d
    debug('^22332^', `dt: ${format_float(dt / 1000)} s`);
    return null;
  };

  //###########################################################################################################
  if (module === require.main) {
    (async() => {
      // await sleep 5
      await demo_2();
      help('ok');
      if (settings.puppeteer.headless) {
        return process.exit(0);
      }
    })();
  }

  /* needed? */

}).call(this);

//# sourceMappingURL=generate-pdf.js.map