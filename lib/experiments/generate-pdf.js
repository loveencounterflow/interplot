(function() {
  'use strict';
  var $, CND, FS, PATH, PD, PUPPETEER, after, alert, assign, async, badge, cast, debug, demo_2, echo_browser_console, get_page, help, info, isa, join_path, jr, page_html_path, rpr, settings, sleep, take_screenshot, type_of, types, urge, validate, warn, whisper;

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
  types = require('../types');

  ({isa, validate, cast, type_of} = types);

  PD = require('pipedreams');

  ({$, async} = PD);

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

  PUPPETEER = require('puppeteer');

  //-----------------------------------------------------------------------------------------------------------
  settings = {
    has_error: false,
    close: {
      on_finish: true,
      on_error: false
    },
    puppeteer: {
      headless: false,
      // headless:           true
      // defaultViweport:
      //   deviceScaleFactor:  0.5
      args: [
        '--disable-infobars', // hide 'Chrome is being controlled by ...'
        '--no-first-run',
        // '--incognito'
        // process.env.NODE_ENV === "production" ? "--kiosk" : null
        '--allow-file-access-from-files',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // '--start-fullscreen'
        '--start-maximized'
      ]
    },
    screenshot: {
      target_selector: '#chart'/* only used when screenshot.puppeteer.fullPage is false */,
      // target_selector:  'div' ### only used when screenshot.puppeteer.fullPage is false ###
      puppeteer: {
        path: PATH.resolve(__dirname, '../../.cache/chart.png'),
        omitBackground: false,
        // fullPage:         true
        fullPage: false,
        type: 'png'
      }
    }
  };

  // clip:
  //   x:                0
  //   y:                0
  //   width:            500
  //   height:           500

  //-----------------------------------------------------------------------------------------------------------
  echo_browser_console = (c) => {
    var ref, ref1, ref2, text;
    // unless c._type in [ 'log', ]
    //   whisper ( rpr c )[ .. 100 ]
    text = (((ref = c._text) != null ? ref : '').replace(/\s+/, ' ')).slice(0, 108);
    if (c._type === 'error') {
      settings.has_error = true;
      warn('µ37763', 'console:', text);
      if ((ref1 = (ref2 = settings.close) != null ? ref2.on_error : void 0) != null ? ref1 : false) {
        after(3, () => {
          return process.exit(1);
        });
      }
    } else {
      // throw new Error text
      //.........................................................................................................
      info('µ37763', `console: ${c._type}: ${text}`);
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  get_page = async function(browser) {
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
  demo_2 = async function() {
    var browser, page, path, pdf, ref, target_selector, url;
    // url             = 'https://de.wikipedia.org/wiki/Berlin'
    // target_selector = '#content'
    // url             = 'http://localhost:8080/slugs'
    // url             = 'http://localhost:8080/slugs', { waitUntil: "networkidle2" }
    // url             = 'http://example.com'
    // target_selector = 'a'
    // target_selector = '#page-ready', { timeout: 600e3, }
    //.........................................................................................................
    url = 'file:///home/flow/jzr/interplot/public/main.html';
    target_selector = '#chart';
    // target_selector = '#chart_ready', { timeout: 600e3, }
    //.........................................................................................................
    // Set up browser and page.
    urge("^interplot/gpdf@4198-1 launching browser");
    browser = (await PUPPETEER.launch(settings.puppeteer));
    page = (await get_page(browser));
    //.........................................................................................................
    page.setViewport({
      width: 1200,
      height: 1200
    });
    page.on('error', (error) => {
      throw error;
    });
    page.on('console', echo_browser_console);
    //.........................................................................................................
    urge("^interplot/gpdf@4198-3 page goto");
    await page.goto(url);
    //.........................................................................................................
    urge("^interplot/gpdf@4198-5 waitForSelector");
    await page.waitForSelector(target_selector);
    //.........................................................................................................
    if (settings.puppeteer.headless) {
      await take_screenshot(page);
      //.......................................................................................................
      urge("^interplot/gpdf@4198-7 wait for PDF");
      pdf = (await page.pdf({
        format: 'A4'
      }));
      //.......................................................................................................
      path = '/tmp/test.pdf';
      (require('fs')).writeFileSync(path, pdf);
      info(`ouput written to ${path}`);
    }
    if ((typeof settings.close === "function" ? settings.close(typeof auto !== "undefined" && auto !== null ? auto : false) : void 0) && ((ref = !settings.has_error) != null ? ref : false)) {
      urge("^interplot/gpdf@4198-8 close");
      await browser.close();
    }
    //.........................................................................................................
    urge("^interplot/gpdf@4198-9 done");
    return null;
  };

  //###########################################################################################################
  if (module.parent == null) {
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
