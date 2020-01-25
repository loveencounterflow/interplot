
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
echo                      = CND.echo.bind CND
PATH                      = require 'path'
FS                        = require 'fs'
{ jr, }                   = CND
assign                    = Object.assign
join_path                 = ( P... ) -> PATH.resolve PATH.join P...
#...........................................................................................................
### TAINT implement in InterText ###
_format                   = require 'number-format.js'
format_float              = ( x ) -> _format '#,##0.000', x
format_integer            = ( x ) -> _format '#,##0.',    x
format_as_percentage      = ( x ) -> _format '#,##0.00',  x * 100
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
LINEMAKER                 = require '../linemaker'
PUPPETEER                 = require 'puppeteer'


#-----------------------------------------------------------------------------------------------------------
settings =
  fallback_font_names:  [ 'Adobe NotDef', 'LastResort', ]
  has_error:            false
  #.........................................................................................................
  close:
    on_finish:  true
    on_error:   false
  #.........................................................................................................
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
      '--auto-open-devtools-for-tabs'
      ]
  # viewport:
  #   ### see https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagesetviewportviewport ###
  #   width:                  1000
  #   height:                 500
  #   deviceScaleFactor:      15
  #.........................................................................................................
  pdf:
    ### see https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagepdfoptions ###
    displayHeaderFooter:    false
    landscape:              false
    printBackground:        true
    # preferCSSPageSize:      true
    format:                 'A4' # takes precedence over width, height
    # width:                  '2000mm'
    # height:                 '50mm'
    margin:
      top:                  '0mm'
      right:                '0mm'
      bottom:               '0mm'
      left:                 '0mm'
  #.........................................................................................................
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
  linenr      = c._location?.lineNumber ? '?'
  path        = c._location?.url        ? '???'
  short_path  = path
  if ( match = path.match /^file:\/\/(?<path>.+)$/ )?
    short_path = PATH.relative process.cwd(), PATH.resolve FS.realpathSync match.groups.path
  path        = short_path unless short_path.startsWith '../'
  location    = "#{path}:#{linenr}"
  text        = c._text ? '???'
  # whisper '^33489^', ( types.all_keys_of c ).sort().join ' ' # [ .. 100 ]
  # whisper '^33489^', ( types.all_keys_of c.valueOf() ).sort().join ' ' # [ .. 100 ]
  # whisper '^33489^', typeof c
  # whisper '^33489^', typeof c.valueOf()
  # debug c.valueOf().jsonValue
  #.........................................................................................................
  if c._type is 'error'
    settings.has_error = true
    warn "#{location}:", text
    if ( settings.close?.on_error ? false )
      after 3, => process.exit 1
    # throw new Error text
  #.........................................................................................................
  else
    whisper "#{location}:", text
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
_devtools_node_from_selector = ( page, doc, selector ) ->
  ### TAINT how are 'devtools nodes' different from DOM nodes? ###
  return await page._client.send 'DOM.querySelector', { nodeId: doc.root.nodeId, selector, }

#-----------------------------------------------------------------------------------------------------------
_raw_font_stats_from_selector = ( page, doc, selector ) ->
  ### see https://chromedevtools.github.io/devtools-protocol/tot/CSS#method-getPlatformFontsForNode ###
  node        = await _devtools_node_from_selector page, doc, selector
  description = await page._client.send 'CSS.getPlatformFontsForNode', { nodeId: node.nodeId, }
  return description.fonts

#-----------------------------------------------------------------------------------------------------------
get_ppt_doc_object = ( page ) ->
  await page._client.send 'DOM.enable'
  await page._client.send 'CSS.enable'
  return await page._client.send 'DOM.getDocument'

#-----------------------------------------------------------------------------------------------------------
nodes_from_display_value = ( page, display_value ) ->
  return await page.evaluate ->
    all_nodes   = Array.from document.querySelectorAll 'body *'
    block_nodes = all_nodes.filter ( d ) -> ( window.getComputedStyle d ).display is 'block'
    return ( selector_of d for d in block_nodes )

#-----------------------------------------------------------------------------------------------------------
XXX_shown = false
XXX_get_styles_for_blocks = ( page ) ->
  return if XXX_shown
  sheets          = []
  locations       = []
  rulesets        = []
  R               = { sheets, locations, rulesets, }
  block_selectors = await nodes_from_display_value page, 'block'
  doc             = await get_ppt_doc_object page
  for selector in block_selectors
    break if XXX_shown
    node        = await _devtools_node_from_selector page, doc, selector
    description = await page._client.send 'DOM.describeNode', { nodeId: node.nodeId, }
    continue unless description.node.localName is 'slug'
    description = await page._client.send 'CSS.getMatchedStylesForNode', { nodeId: node.nodeId, }
    # description = await page._client.send 'CSS.getComputedStyleForNode', { nodeId: node.nodeId, }
    path = '/tmp/slug-css.json'
    FS.writeFileSync path, JSON.stringify description.matchedCSSRules, null, '  '
    help "^4987^ styles written to #{path}"
    for stylesheet in description.matchedCSSRules
      # whisper '———————————————————————', "styleSheetId:", stylesheet.rule.styleSheetId
      ### TAINT consider to add filepath, linenr etc. here ###
      { cssProperties
        shorthandEntries
        range             } = stylesheet.rule.style
      sheet                 = { styleSheetId: stylesheet.rule.styleSheetId, }
      rules                 = {}
      #.....................................................................................................
      if range?
        first_linenr  = range.startLine   + 1
        first_colnr   = range.startColumn + 1
        last_linenr   = range.endLine     + 1
        last_colnr    = range.startColumn + 1
        location      = { first:  { linenr: first_linenr, colnr: first_colnr, }, \
                          last:   { linenr: last_linenr,  colnr: last_colnr,  }, }
      #.....................................................................................................
      else
        location      = null
      #.....................................................................................................
      sheets.push     sheet
      rulesets.push   rules
      locations.push  location
      #.....................................................................................................
      debug '^777^', shorthand_entry_names = new Set ( d.name for d in shorthandEntries )
      for property in cssProperties
        continue if shorthand_entry_names.has property.name
        rules[ property.name ] = property.value
    XXX_shown = true
    R.verdicts = Object.assign {}, R.rulesets...
  return R

#-----------------------------------------------------------------------------------------------------------
mark_blocks_with_fallback_glyphs = ( page ) ->
  ### TAINT could conceivably be faster because we first retrieve block nodes from the DOM, then try to find
  a selector string for each node, then pass each selector back in to retrieve the respective node again ###
  R               = []
  block_selectors = await nodes_from_display_value page, 'block'
  doc             = await get_ppt_doc_object page
  for selector in block_selectors
    raw_font_stats  = await _raw_font_stats_from_selector page, doc, selector
    for font in raw_font_stats
      continue unless font.familyName in settings.fallback_font_names
      R.push selector
      await page.evaluate ( ( selector ) -> ( $ selector ).addClass 'has-fallback-glyphs' ), selector
  #.........................................................................................................
  return R

#-----------------------------------------------------------------------------------------------------------
show_global_font_stats = ( page ) ->
  doc             = await get_ppt_doc_object page
  ### thx to https://stackoverflow.com/a/47914111/7568091 ###
  raw_font_stats  = await _raw_font_stats_from_selector page, doc, 'body'
  R               = []
  glyph_total     = raw_font_stats.reduce ( ( acc, d ) -> acc + d.glyphCount ), 0
  raw_font_stats.sort ( a, b ) -> - ( a.glyphCount - b.glyphCount )
  fallbacks       = []
  echo CND.grey "—".repeat 108
  echo CND.grey "^interplot/show_global_font_stats@55432^"
  echo CND.steel "Font Statistics:"
  for font in raw_font_stats
    { familyName: font_name, glyphCount: glyph_count, } = font
    font_name_txt   = CND.lime  ( jr font_name                                    ).padEnd   40
    glyph_count_txt = CND.white ( format_integer glyph_count                      ).padStart 15
    percentage_txt  = CND.gold  ( format_as_percentage glyph_count / glyph_total  ).padStart 10
    echo font_name_txt, glyph_count_txt, percentage_txt
    d               = { font_name, glyph_count, }
    fallbacks.push font_name if font_name in settings.fallback_font_names
    R.push d
  #.........................................................................................................
  unless isa.empty fallbacks
    selectors = await mark_blocks_with_fallback_glyphs  page
    echo CND.red CND.reverse CND.bold " Fallback fonts detected: #{fallbacks.join ', '} "
    echo CND.red "in DOM nodes: #{ ( jr d for d in selectors ).join ', '} "
  #.........................................................................................................
  echo CND.grey "—".repeat 108
  return R

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
  # await page.exposeFunction 'sha1', ( text ) =>
  #   ( require 'crypto' ).createHash( 'sha1' ).update( text ).digest( 'hex' )[ .. 17 ]
  await page.exposeFunction 'TEMPLATES_slug', ( P... ) => ( require '../templates' ).slug P...
  #.........................................................................................................
  urge "waitForSelector"
  await page.waitForSelector target_selector
  #.........................................................................................................
  await demo_insert_slabs                 page
  await show_global_font_stats            page
  info '^8887^', await XXX_get_styles_for_blocks         page
  #.........................................................................................................
  if settings.puppeteer.headless
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

#-----------------------------------------------------------------------------------------------------------
### TAINT use OPS proxy or `require` OPS into this context ###
OPS_slugs_with_metrics_from_slabs = ( page, P... ) ->
  return await page.evaluate ( ( P... ) -> OPS.slugs_with_metrics_from_slabs P... ), P...

#-----------------------------------------------------------------------------------------------------------
demo_insert_slabs = ( page ) ->
  text                = """其法用膠泥刻字，薄如錢唇，每字為一印，火燒令堅。先設一鐵版，其上以松脂臘和紙灰之類冒之。"""
  text                = """III刻文字III每字印\u3000III"""
  text                = """自馮瀛王始印五經已後典籍皆為版本其法用膠泥刻字"""
  text                = """Rectangle自馮瀛王始印五經apostolary已後典籍皆為版本其法用膠泥刻字"""
  text                = """Yaffir rectangle刻文字apostolary. Letterpress printing."""

  text                = """Letterpress printing is a technique of relief printing using a printing press, a
  process by which many copies are produced by repeated direct impression of an inked, raised surface
  against sheets or a continuous roll of paper. A worker composes and locks movable type into the "bed" or
  "chase" of a press, inks it, and presses paper against it to transfer the ink from the type which creates
  an impression on the paper. In typesetting by hand compositing, a sort or type is a piece of type
  representing a particular letter or symbol, cast from a matrix mold and assembled with other sorts bearing
  additional letters into lines of type to make up a form from which a page is printed."""

  slabs_dtm           = LINEMAKER.slabs_from_text text
  validate.interplot_slabs_datom slabs_dtm
  # html    = await page.evaluate ( ( slabs_dtm ) -> OPS.demo_insert_slabs slabs_dtm ), slabs_dtm
  XXX_settings        = { min_slab_idx: 0, }
  t0 = Date.now()
  slugs_with_metrics  = await OPS_slugs_with_metrics_from_slabs page, slabs_dtm, XXX_settings
  dt = Date.now() - t0
  for d in slugs_with_metrics
    info '^53566^', "slugs_with_metrics", jr d
  debug '^22332^', "dt: #{format_float dt / 1000} s"
  return null
  ### ((畢昇發明活字印刷術))

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
  ###


  # # page.click '#writehere'
  # debug '^22762^', "sending keys"
  # text = "this text courtesy of Puppeteer"
  # await page.type '#writehere', text #, { delay: 10, }
  # # await page.keyboard.down 'Shift'
  # # for chr in text
  # #   await page.keyboard.down 'ArrowLeft'
  # #   await page.keyboard.up 'ArrowLeft'
  # # await page.keyboard.up 'Shift'
  # # await sleep 1
  # # await page.keyboard.down 'Tab'
  # # await page.keyboard.up 'Tab'
  # # await page.keyboard.down 'Shift'
  # # for _ in [ 1 .. 60 ]
  # #   rectangle = await page.evaluate -> OPS.rectangle_from_selection()
  # #   info '^34736^', "selection x:", rectangle.x - delta
  # #   await page.keyboard.press 'ArrowRight'
  #   # await page.keyboard.down 'ArrowRight'
  #   # await page.keyboard.up 'ArrowRight'
  #   # info '^34736^', "selection width:", jr rectangle.width
  # # await page.keyboard.press('KeyA');
  # # await page.keyboard.up('Shift');
  # # await page.keyboard.press('KeyA');
  # # await page.focus target_selector # doesn't work??
  # # after 10, ->
  #   # debug '^22762^', "page.select", page.select 'stick#xe761'
  #   # page.keyboard.press 'ShiftRight'
  #   # page.keyboard.press 'ShiftRight'
  #   # page.keyboard.press 'ShiftRight'
  # #.........................................................................................................
  # # info '^33987^', jr await page.evaluate OPS.demo_ranges_and_coordinates()
  # # info '^33987^', jr await page.evaluate OPS.demo_jquery_test()
  # # info '^33987^', "OPS.demo_insert_html_fragment()  ", jr await page.evaluate -> OPS.demo_insert_html_fragment()
  # # info '^33987^', "OPS.demo_find_end_of_line()      ", jr await page.evaluate -> OPS.demo_find_end_of_line()
  # #.........................................................................................................
  # ### thx to https://github.com/puppeteer/puppeteer/issues/4419 ###
  # # session = await page.target().createCDPSession()
  # # await session.send 'Emulation.setPageScaleFactor', { pageScaleFactor: 0.1, }
  #   # await page.emulate {
  #   #   name: 'MingKwai Typesetter / InterPlot',
  #   #   userAgent: 'Mozilla/5.0 (Linux; Android 7.1.1; Nexus 6 Build/N6F26U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36',
  #   #   viewport:
  #   #     width:              40000
  #   #     height:             50000
  #   #     deviceScaleFactor:  1
  #   #     isMobile:           true
  #   #     hasTouch:           false
  #   #     isLandscape:        true }
  #   #.......................................................................................................
  #   # await take_screenshot page
  #   #.......................................................................................................


############################################################################################################
if module is require.main then do =>
  # await sleep 5
  await demo_2()
  help 'ok'
  if settings.puppeteer.headless
    process.exit 0 ### needed? ###



