(function() {
  'use strict';
  var CND, FS, LINEMAKER, OPS_slugs_with_metrics_from_slabs, PATH, PUPPETEER, _devtools_node_from_selector, _format, _raw_font_stats_from_selector, after, alert, assign, badge, cache, cast, computed_styles_from_selector, debug, demo_2, demo_insert_slabs, echo, echo_browser_console, format_as_percentage, format_float, format_integer, get_all_selectors, get_base_style, get_page, get_ppt_doc_object, help, info, isa, join_path, jr, mark_elements_with_fallback_glyphs, page_html_path, profile, rpr, selectors_from_display_value, settings, show_global_font_stats, sleep, styles_from_nodeid, styles_from_selector, take_screenshot, type_of, types, urge, validate, warn, whisper,
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
  // _format                   = require 'number-format.js'
  _format = CND.format_number;

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

  ({isa, validate, cast, type_of} = types);

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
      whisper(`${location}:`, text);
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
          return ($(selector)).addClass('has-fallback-glyphs');
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
    var base_style, browser, browser_settings, computed_style, page, path, pdf, ref, ref1, styles, target_selector, url;
    url = 'https://de.wikipedia.org/wiki/Berlin';
    target_selector = '#content';
    // url             = 'http://localhost:8080/slugs'
    // url             = 'http://localhost:8080/slugs', { waitUntil: "networkidle2" }
    // url             = 'http://example.com'
    // target_selector = 'a'
    // target_selector = '#page-ready', { timeout: 600e3, }
    // #.........................................................................................................
    // url             = 'file:///home/flow/jzr/interplot/public/main.html'
    // target_selector = '#chart'
    // # target_selector = '#chart_ready', { timeout: 600e3, }
    // #.........................................................................................................
    // url             = 'file:///home/flow/jzr/interplot/public/demo-columns/main.html'
    // target_selector = '#page-ready'
    //.........................................................................................................
    url = 'file:///home/flow/jzr/interplot/public/demo-galley/main.html';
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
    //.........................................................................................................
    urge("expose slug, pointer functions");
    await page.exposeFunction('TEMPLATES_slug', (...P) => {
      return (require('../template-elements')).slug(...P);
    });
    await page.exposeFunction('TEMPLATES_pointer', (...P) => {
      return (require('../template-elements')).pointer(...P);
    });
    //.........................................................................................................
    urge("demo_insert_slabs");
    // await profile page, -> await demo_insert_slabs page
    await demo_insert_slabs(page);
    //.........................................................................................................
    debug('^12221^', jr((await computed_styles_from_selector(page, 'slug'))));
    styles = (await styles_from_selector(page, 'slug'));
    base_style = (await get_base_style(page));
    computed_style = {...base_style, ...styles.verdicts};
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
    text = `III刻文字III每字印\u3000III`;
    text = `自馮瀛王始印五經已後典籍皆為版本其法用膠泥刻字`;
    text = `Rectangle自馮瀛王始印五經apostolary已後典籍皆為版本其法用膠泥刻字`;
    text = `Yaffir rectangle刻文字apostolary. Letterpress printing.`;
    text = `其法用膠泥刻字，薄如錢唇，每字為一印，火燒令堅。先設一鐵版，其上以松脂臘和紙灰之類冒之。`;
    text = `䷾Letterpress printing is a technique of relief printing using a printing press, a
process by which many copies are produced by repeated direct impression of an inked, raised surface
against sheets or a continuous roll of paper. A worker composes and locks movable type into the "bed" or
"chase" of a press, inks it, and presses paper against it to transfer the ink from the type which creates
an impression on the paper. ䷾In typesetting by hand compositing, a sort or type is a piece of type
representing a particular letter or symbol, cast from a matrix mold and assembled with other sorts bearing
additional letters into lines of type to make up a form from which a page is printed.`;
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

  /* ((畢昇發明活字印刷術))

    宋沈括著《夢溪筆談》卷十八記載
    ((版印書籍唐人尚未盛為之))
    自馮瀛王始印五經已後典籍皆為版本
    ((慶歷中，有布衣畢昇，又為活版。))
    其法用膠泥刻字，薄如錢唇，每字為一印，火燒令堅。先設一鐵版，其上以松脂臘和紙灰之類冒之。
    欲印則以一鐵範置鐵板上，乃密布字印。滿鐵範為一板，
    持就火煬之，藥稍鎔，則以一平板按其面，則字平如砥。
    ((若止印三、二本，未為簡易；若印數十百千本，則極為神速。))
    常作二鐵板，一板印刷，一板已自布字。此印者才畢，則第二板已具。
    更互用之，瞬息可就。每一字皆有數印，如之、也等字，每字有二十餘印，
    以備一板內有重複者。不用則以紙貼之，每韻為一貼，木格貯之。
    ((有奇字素無備者，旋刻之，以草火燒，瞬息可成。))
    不以木為之者，木理有疏密，沾水則高下不平，兼與藥相粘，不可取。
    不若燔土，用訖再火令藥熔，以手拂之，其印自落，
    殊不沾汙。昇死，其印為余群從所得，
    ((至今保藏。))
  */
  // # page.click '#writehere'
  // debug '^22762^', "sending keys"
  // text = "this text courtesy of Puppeteer"
  // await page.type '#writehere', text #, { delay: 10, }
  // # await page.keyboard.down 'Shift'
  // # for chr in text
  // #   await page.keyboard.down 'ArrowLeft'
  // #   await page.keyboard.up 'ArrowLeft'
  // # await page.keyboard.up 'Shift'
  // # await sleep 1
  // # await page.keyboard.down 'Tab'
  // # await page.keyboard.up 'Tab'
  // # await page.keyboard.down 'Shift'
  // # for _ in [ 1 .. 60 ]
  // #   rectangle = await page.evaluate -> OPS.rectangle_from_selection()
  // #   info '^34736^', "selection x:", rectangle.x - delta
  // #   await page.keyboard.press 'ArrowRight'
  //   # await page.keyboard.down 'ArrowRight'
  //   # await page.keyboard.up 'ArrowRight'
  //   # info '^34736^', "selection width:", jr rectangle.width
  // # await page.keyboard.press('KeyA');
  // # await page.keyboard.up('Shift');
  // # await page.keyboard.press('KeyA');
  // # await page.focus target_selector # doesn't work??
  // # after 10, ->
  //   # debug '^22762^', "page.select", page.select 'stick#xe761'
  //   # page.keyboard.press 'ShiftRight'
  //   # page.keyboard.press 'ShiftRight'
  //   # page.keyboard.press 'ShiftRight'
  // #.........................................................................................................
  // # info '^33987^', jr await page.evaluate OPS.demo_ranges_and_coordinates()
  // # info '^33987^', jr await page.evaluate OPS.demo_jquery_test()
  // # info '^33987^', "OPS.demo_insert_html_fragment()  ", jr await page.evaluate -> OPS.demo_insert_html_fragment()
  // # info '^33987^', "OPS.demo_find_end_of_line()      ", jr await page.evaluate -> OPS.demo_find_end_of_line()
  // #.........................................................................................................
  // ### thx to https://github.com/puppeteer/puppeteer/issues/4419 ###
  // # session = await page.target().createCDPSession()
  // # await session.send 'Emulation.setPageScaleFactor', { pageScaleFactor: 0.1, }
  //   # await page.emulate {
  //   #   name: 'MingKwai Typesetter / InterPlot',
  //   #   userAgent: 'Mozilla/5.0 (Linux; Android 7.1.1; Nexus 6 Build/N6F26U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36',
  //   #   viewport:
  //   #     width:              40000
  //   #     height:             50000
  //   #     deviceScaleFactor:  1
  //   #     isMobile:           true
  //   #     hasTouch:           false
  //   #     isLandscape:        true }
  //   #.......................................................................................................
  //   # await take_screenshot page
  //   #.......................................................................................................

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