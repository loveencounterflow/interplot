(function() {
  var PATH;

  PATH = require('path');

  //-----------------------------------------------------------------------------------------------------------
  module.exports = {
    fallback_font_names: ['Adobe NotDef', 'LastResort'],
    has_error: false,
    //.........................................................................................................
    close: {
      on_finish: true,
      on_error: false
    },
    //.........................................................................................................
    url: null, // 'file:///home/flow/jzr/interplot/public/demo-galley/main.html'
    wait_for_selector: null, // '#page-ready'
    gui: false,
    //.........................................................................................................
    puppeteer: {
      headless: false,
      // headless:           true
      pipe: true/* use pipe instead of web sockets for communication */,
      // slowMo:             250 # slow down by 250ms
      defaultViewport: null,
      // defaultViewport:
      //   width:                  100
      //   height:                 100
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
        // '--start-maximized'
        '--window-size=1200,500',
        '--high-dpi-support=1',
        // '--force-device-scale-factor=0.9' ### ca. 0.5 .. 1.0, smaller number scales down entire UI ###
        '--auto-open-devtools-for-tabs'
      ]
    },
    // viewport:
    //   ### see https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagesetviewportviewport ###
    //   width:                  1000
    //   height:                 500
    //   deviceScaleFactor:      15
    //.........................................................................................................
    // '--enable-blink-features=CSSSnapSize' ### see https://developer.mozilla.org/en-US/docs/Web/CSS/line-height-step ###
    pdf: {
      /* see https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagepdfoptions */
      displayHeaderFooter: false,
      landscape: false,
      printBackground: true,
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
    //.........................................................................................................
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

}).call(this);
