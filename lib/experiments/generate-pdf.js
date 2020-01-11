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
      defaultViewport: null,
      //   width:                  1000
      //   height:                 500
      //   deviceScaleFactor:      1
      ignoreDefaultArgs: ['--enable-automation'],
      args: [
        /* see https://peter.sh/experiments/chromium-command-line-switches/ */
        /* https://github.com/GoogleChrome/chrome-launcher/blob/master/docs/chrome-flags-for-tools.md */
        // '--disable-infobars' # hide 'Chrome is being controlled by ...'
        '--no-first-run',
        // '--enable-automation'
        '--no-default-browser-check',
        // '--incognito'
        // process.env.NODE_ENV === "production" ? "--kiosk" : null
        '--allow-file-access-from-files',
        // '--no-sandbox'
        // '--disable-setuid-sandbox'
        // '--start-fullscreen'
        '--start-maximized',
        '--auto-open-devtools-for-tabs'
      ]
    },
    // viewport:
    //   ### see https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagesetviewportviewport ###
    //   width:                  1000
    //   height:                 500
    //   deviceScaleFactor:      15
    pdf: {
      /* see https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagepdfoptions */
      displayHeaderFooter: false,
      landscape: false,
      // preferCSSPageSize:      true
      format: 'A4', // takes precedence over width, height
      // width:                  '2000mm'
      // height:                 '50mm'
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
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
    // whisper '^33489^', ( rpr c ) # [ .. 100 ]
    text = (((ref = c._text) != null ? ref : '???').replace(/\s+/, ' ')).slice(0, 108);
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
    var browser, element_handle, page, path, pdf, ref, target_selector, url;
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
    //.........................................................................................................
    url = 'file:///home/flow/jzr/interplot/public/demo-columns/index.html';
    target_selector = '#page-ready';
    //.........................................................................................................
    // Set up browser and page.
    urge("launching browser");
    browser = (await PUPPETEER.launch(settings.puppeteer));
    page = (await get_page(browser));
    //.........................................................................................................
    page.on('error', (error) => {
      throw error;
    });
    page.on('console', echo_browser_console);
    //.........................................................................................................
    urge("emulate media: 'screen'");
    await page.emulateMedia('screen');
    await page._client.send('Emulation.clearDeviceMetricsOverride');
    // await page.emulateMedia null
    // page.setViewport settings.viewport
    // await page.emulate PUPPETEER.devices[ 'iPhone 6' ]
    //.........................................................................................................
    urge(`goto ${url}`);
    await page.goto(url);
    //.........................................................................................................
    urge("waitForSelector");
    await page.waitForSelector(target_selector);
    // await page.focus 'div'
    // await page.mainFrame().focus 'div'
    // await page.keyboard.type 'helo'
    element_handle = (await page.$('div'));
    debug('^77788^', (await element_handle.click()));
    //.........................................................................................................
    if (settings.puppeteer.headless) {
      //.......................................................................................................
      // await take_screenshot page
      //.......................................................................................................
      urge("write PDF");
      pdf = (await page.pdf(settings.pdf));
      path = '/tmp/test.pdf';
      (require('fs')).writeFileSync(path, pdf);
      info(`ouput written to ${path}`);
    }
    if ((typeof settings.close === "function" ? settings.close(typeof auto !== "undefined" && auto !== null ? auto : false) : void 0) && ((ref = !settings.has_error) != null ? ref : false)) {
      urge("close");
      await browser.close();
    }
    //.........................................................................................................
    urge("done");
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
