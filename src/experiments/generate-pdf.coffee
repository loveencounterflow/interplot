
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'INTERPLOT/GENERATE-PDF'
debug                     = CND.get_logger 'debug',     badge
alert                     = CND.get_logger 'alert',     badge
whisper                   = CND.get_logger 'whisper',   badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
info                      = CND.get_logger 'info',      badge
PATH                      = require 'path'
FS                        = require 'fs'
{ jr, }                   = CND
assign                    = Object.assign
join_path                 = ( P... ) -> PATH.resolve PATH.join P...
#...........................................................................................................
types                     = require '../types'
{ isa
  validate
  cast
  type_of }               = types
PD                        = require 'pipedreams'
{ $
  async }                 = PD
#...........................................................................................................
after                     = ( dts, f ) -> setTimeout f, dts * 1000
sleep                     = ( dts ) -> new Promise ( done ) -> after dts, done
page_html_path            = PATH.resolve PATH.join __dirname, '../../../public/main.html'
PUPPETEER                 = require 'puppeteer'

#-----------------------------------------------------------------------------------------------------------
settings =
  has_error:    false
  close:
    on_finish:  true
    on_error:   false
  puppeteer:
    headless:           false
    # headless:           true
    defaultViewport:    null
    pipe:               true ### use pipe instead of web sockets for communication ###
    # slowMo:             250 # slow down by 250ms

    #   width:                  1000
    #   height:                 500
    #   deviceScaleFactor:      1
    ignoreDefaultArgs:  [ '--enable-automation', ]
    args: [
      ### see https://peter.sh/experiments/chromium-command-line-switches/ ###
      ### https://github.com/GoogleChrome/chrome-launcher/blob/master/docs/chrome-flags-for-tools.md ###
      # '--disable-infobars' # hide 'Chrome is being controlled by ...'
      '--no-first-run'
      # '--enable-automation'
      '--no-default-browser-check'
      # '--incognito'
      # process.env.NODE_ENV === "production" ? "--kiosk" : null
      '--allow-file-access-from-files'
      # '--no-sandbox'
      # '--disable-setuid-sandbox'
      # '--start-fullscreen'
      '--start-maximized'
      '--high-dpi-support=1'
      # '--force-device-scale-factor=0.9' ### ca. 0.5 .. 1.0, smaller number scales down entire UI ###
      # '--auto-open-devtools-for-tabs'
      ]
  # viewport:
  #   ### see https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagesetviewportviewport ###
  #   width:                  1000
  #   height:                 500
  #   deviceScaleFactor:      15
  pdf:
    ### see https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagepdfoptions ###
    displayHeaderFooter:    false
    landscape:              false
    # preferCSSPageSize:      true
    format:                 'A4' # takes precedence over width, height
    # width:                  '2000mm'
    # height:                 '50mm'
    margin:
      top:                  '0mm'
      right:                '0mm'
      bottom:               '0mm'
      left:                 '0mm'
  screenshot:
    target_selector:  '#chart' ### only used when screenshot.puppeteer.fullPage is false ###
    # target_selector:  'div' ### only used when screenshot.puppeteer.fullPage is false ###
    puppeteer:
      path:             PATH.resolve __dirname, '../../.cache/chart.png'
      omitBackground:   false
      # fullPage:         true
      fullPage:         false
      type:             'png'
      # clip:
      #   x:                0
      #   y:                0
      #   width:            500
      #   height:           500

#-----------------------------------------------------------------------------------------------------------
echo_browser_console = ( c ) =>
  # unless c._type in [ 'log', ]
  # whisper '^33489^', ( rpr c ) # [ .. 100 ]
  text = ( ( c._text ? '???' ).replace /\s+/, ' ' )[ ... 108 ]
  if c._type is 'error'
    settings.has_error = true
    warn 'µ37763', 'console:', text
    if ( settings.close?.on_error ? false )
      after 3, => process.exit 1
    # throw new Error text
  #.........................................................................................................
  else
    whisper "^console/#{c._type}^", text
  return null

#-----------------------------------------------------------------------------------------------------------
get_page = ( browser ) ->
  if isa.empty ( pages = await browser.pages() )
    urge "µ29923-2 new page";           R = await browser.newPage()
  else
    urge "µ29923-2 use existing page";  R = pages[ 0 ]
  return R

#-----------------------------------------------------------------------------------------------------------
take_screenshot = ( page ) ->
  urge "µ29923-6 take screenshot"
  #.........................................................................................................
  if settings.screenshot.puppeteer.fullPage
    await page.screenshot settings.screenshot.puppeteer
  #.........................................................................................................
  else
    #.......................................................................................................
    urge "µ29923-5 page goto"
    target_selector = settings.screenshot.target_selector
    chart_dom = await page.$ target_selector
    #.......................................................................................................
    unless chart_dom?
      warn "unable to take screenshot: DOM element #{rpr target_selector} not found"
      return null
    #.......................................................................................................
    urge "µ29923-6 take screenshot"
    await chart_dom.screenshot settings.screenshot.puppeteer
  #.........................................................................................................
  help "output written to #{PATH.relative process.cwd(), settings.screenshot.puppeteer.path}"
  return null

#-----------------------------------------------------------------------------------------------------------
demo_2 = ->
  url             = 'https://de.wikipedia.org/wiki/Berlin'
  target_selector = '#content'
  # url             = 'http://localhost:8080/slugs'
  # url             = 'http://localhost:8080/slugs', { waitUntil: "networkidle2" }
  # url             = 'http://example.com'
  # target_selector = 'a'
  # target_selector = '#page-ready', { timeout: 600e3, }
  # #.........................................................................................................
  # url             = 'file:///home/flow/jzr/interplot/public/main.html'
  # target_selector = '#chart'
  # # target_selector = '#chart_ready', { timeout: 600e3, }
  # #.........................................................................................................
  # url             = 'file:///home/flow/jzr/interplot/public/demo-columns/main.html'
  # target_selector = '#page-ready'
  #.........................................................................................................
  url             = 'file:///home/flow/jzr/interplot/public/demo-galley/main.html'
  target_selector = '#page-ready'
  #.........................................................................................................
  # Set up browser and page.
  urge "launching browser";  browser = await PUPPETEER.launch settings.puppeteer
  page = await get_page browser
  #.........................................................................................................
  page.on 'error', ( error ) => throw error
  page.on 'console', echo_browser_console
  #.........................................................................................................
  media = 'print'
  urge "emulate media: #{rpr media}"
  debug '^4432^', await page.evaluate -> ( matchMedia 'print' ).matches
  await page.emulateMediaType media
  debug '^4432^', await page.evaluate -> ( matchMedia 'print' ).matches
  await page._client.send 'Emulation.clearDeviceMetricsOverride'
  # await page.emulateMedia null
  # page.setViewport settings.viewport
  # await page.emulate PUPPETEER.devices[ 'iPhone 6' ]
  # await page.emulate PUPPETEER.devices[ 'Galaxy Note 3 landscape' ]
  #.........................................................................................................
  urge "goto #{url}"
  await page.goto url
  #.........................................................................................................
  urge "waitForSelector"
  await page.waitForSelector target_selector
  # page.click '#writehere'
  debug '^22762^', "sending keys"
  text = "this text courtesy of Puppeteer"
  await page.type '#writehere', text #, { delay: 10, }
  # await page.keyboard.down 'Shift'
  # for chr in text
  #   await page.keyboard.down 'ArrowLeft'
  #   await page.keyboard.up 'ArrowLeft'
  # await page.keyboard.up 'Shift'
  # await sleep 1
  await page.keyboard.down 'Tab'
  await page.keyboard.up 'Tab'
  delta = parseFloat await page.evaluate -> ( $ 'p' ).offset().left
  # await page.keyboard.down 'Shift'
  # for _ in [ 1 .. 60 ]
  #   rectangle = await page.evaluate -> OPS.rectangle_from_selection()
  #   info '^34736^', "selection x:", rectangle.x - delta
  #   await page.keyboard.press 'ArrowRight'
    # await page.keyboard.down 'ArrowRight'
    # await page.keyboard.up 'ArrowRight'
    # info '^34736^', "selection width:", jr rectangle.width
  # await page.keyboard.press('KeyA');
  # await page.keyboard.up('Shift');
  # await page.keyboard.press('KeyA');
  # await page.focus target_selector # doesn't work??
  # after 10, ->
    # debug '^22762^', "page.select", page.select 'stick#xe761'
    # page.keyboard.press 'ShiftRight'
    # page.keyboard.press 'ShiftRight'
    # page.keyboard.press 'ShiftRight'
  #.........................................................................................................
  # info '^33987^', jr await page.evaluate OPS.demo_ranges_and_coordinates()
  # info '^33987^', jr await page.evaluate OPS.demo_jquery_test()
  info '^33987^', "number of DOM elements:          ", jr await page.evaluate -> OPS.demo_jquery_test()
  # info '^33987^', "OPS.demo_insert_html_fragment()  ", jr await page.evaluate -> OPS.demo_insert_html_fragment()
  # info '^33987^', "OPS.demo_find_end_of_line()      ", jr await page.evaluate -> OPS.demo_find_end_of_line()
  #.........................................................................................................
  ### thx to https://github.com/puppeteer/puppeteer/issues/4419 ###
  # session = await page.target().createCDPSession()
  # await session.send 'Emulation.setPageScaleFactor', { pageScaleFactor: 0.1, }
  #.........................................................................................................
  if settings.puppeteer.headless
    # await page.emulate {
    #   name: 'MingKwai Typesetter / InterPlot',
    #   userAgent: 'Mozilla/5.0 (Linux; Android 7.1.1; Nexus 6 Build/N6F26U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36',
    #   viewport:
    #     width:              40000
    #     height:             50000
    #     deviceScaleFactor:  1
    #     isMobile:           true
    #     hasTouch:           false
    #     isLandscape:        true }
    #.......................................................................................................
    # await take_screenshot page
    #.......................................................................................................
    urge "write PDF"
    pdf   = await page.pdf settings.pdf
    path  = '/tmp/test.pdf'
    ( require 'fs' ).writeFileSync path, pdf
    info "ouput written to #{path}"
  #.........................................................................................................
  if ( settings.close?auto ? false ) and ( not settings.has_error ? false )
    urge "close"
    await browser.close()
  #.........................................................................................................
  urge "done"
  return null



############################################################################################################
if module is require.main then do =>
  # await sleep 5
  await demo_2()
  help 'ok'
  if settings.puppeteer.headless
    process.exit 0 ### needed? ###



