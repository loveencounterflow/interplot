
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
  equals
  type_of }               = types
#...........................................................................................................
after                     = ( dts, f ) -> setTimeout f, dts * 1000
sleep                     = ( dts ) -> new Promise ( done ) -> after dts, done
page_html_path            = PATH.resolve PATH.join __dirname, '../../../public/main.html'
LINEMAKER                 = require '../linemaker'
PUPPETEER                 = require 'puppeteer'
#...........................................................................................................
cache                     = {}
settings                  = require '../settings'



#-----------------------------------------------------------------------------------------------------------
_prv_console_warning = null
echo_browser_console = ( c ) =>
  ### OK ###
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
    if c._type is 'warning'
      return if text is _prv_console_warning
      _prv_console_warning = text
    else
      _prv_console_warning = null
    whisper "^44598^ #{c._type} #{location}:", text
  return null

#-----------------------------------------------------------------------------------------------------------
get_page = ( browser ) ->
  ### OK ###
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
  return R if ( R = cache.ppt_doc_object )?
  await page._client.send 'DOM.enable'
  await page._client.send 'CSS.enable'
  R = cache.ppt_doc_object = await page._client.send 'DOM.getDocument'
  return R

#-----------------------------------------------------------------------------------------------------------
get_base_style = ( page ) ->
  ### NOTE observe that due to caching, page base style may not be up-to-date after page styles changed ###
  return R if ( R = cache.base_style )?
  return cache.base_style = await page.evaluate ->
    style_obj = window.getComputedStyle document.querySelector 'unstyledelement'
    R         = {}
    # for idx in [ 0 ... style_obj.length ]
    #   key       = style_obj[ idx ]
    #   R[ key ]  = style_obj.getPropertyValue key
    ### NOTE iterate as if object were a list, use API method with key instead of bracket syntax: ###
    for key in style_obj
      R[ key ]  = style_obj.getPropertyValue key
    return R

#-----------------------------------------------------------------------------------------------------------
selectors_from_display_value = ( page, display_value ) ->
  return await page.evaluate ->
    all_nodes   = Array.from document.querySelectorAll 'body *'
    block_nodes = all_nodes.filter ( d ) -> ( window.getComputedStyle d ).display is 'block'
    return ( selector_of d for d in block_nodes )

#-----------------------------------------------------------------------------------------------------------
get_all_selectors = ( page ) ->
  return await page.evaluate ->
    all_nodes   = Array.from document.querySelectorAll 'body *'
    return ( selector_of d for d in all_nodes )

#-----------------------------------------------------------------------------------------------------------
computed_styles_from_selector = ( page, selector ) ->
  styles          = await styles_from_selector page, 'slug'
  debug '^33334^', styles
  base_style      = await get_base_style page
  return { base_style..., styles.verdicts..., }

#-----------------------------------------------------------------------------------------------------------
styles_from_selector = ( page, selector ) ->
  doc             = await get_ppt_doc_object page
  node            = await _devtools_node_from_selector page, doc, selector
  # debug '^33334^', jr description = await page._client.send 'DOM.describeNode', { nodeId: node.nodeId, }
  return styles_from_nodeid page, node.nodeId

#-----------------------------------------------------------------------------------------------------------
styles_from_nodeid = ( page, nodeid ) ->
  sheets          = []
  locations       = []
  rulesets        = []
  R               = { sheets, locations, rulesets, }
  doc             = await get_ppt_doc_object page
  description     = await page._client.send 'CSS.getMatchedStylesForNode', { nodeId: nodeid, }
  #.........................................................................................................
  for stylesheet in description.matchedCSSRules
    sheet                 = { styleSheetId: stylesheet.rule.styleSheetId, }
    rules                 = {}
    shorthand_entry_names = new Set ( d.name for d in stylesheet.rule.style.shorthandEntries )
    #.......................................................................................................
    if ( range = stylesheet.rule.style.range )?
      # debug '^33378^', range
      first_linenr  = range.startLine   + 1
      first_colnr   = range.startColumn + 1
      last_linenr   = range.endLine     + 1
      last_colnr    = range.startColumn + 1
      location      = { first:  { linenr: first_linenr, colnr: first_colnr, }, \
                        last:   { linenr: last_linenr,  colnr: last_colnr,  }, }
    #.......................................................................................................
    else
      location      = null
    #.......................................................................................................
    sheets.push     sheet
    rulesets.push   rules
    locations.push  location
    #.......................................................................................................
    for property in stylesheet.rule.style.cssProperties
      continue if shorthand_entry_names.has property.name
      rules[ property.name ] = property.value
  #.........................................................................................................
  R.verdicts = Object.assign {}, R.rulesets...
  # for key, value of R.verdicts
  #   delete R.verdicts[ key ] if value is 'initial'
  return R

#-----------------------------------------------------------------------------------------------------------
mark_elements_with_fallback_glyphs = ( page ) ->
  ### TAINT could conceivably be faster because we first retrieve block nodes from the DOM, then try to find
  a selector string for each node, then pass each selector back in to retrieve the respective node again ###
  R         = []
  selectors = await get_all_selectors page
  doc       = await get_ppt_doc_object page
  #.........................................................................................................
  echo CND.grey "—".repeat 108
  echo CND.steel "Missing Glyphs per Element:"
  #.........................................................................................................
  for selector in selectors
    selector_txt    = CND.gold selector.padEnd 50
    raw_font_stats  = await _raw_font_stats_from_selector page, doc, selector
    for font in raw_font_stats
      continue unless font.familyName in settings.fallback_font_names
      font_name_txt = CND.lime font.familyName.padEnd 50
      count_txt     = CND.white ( format_integer font.glyphCount ).padStart 5
      echo font_name_txt, count_txt, selector_txt
      R.push selector
      await page.evaluate ( ( selector ) -> µ.DOM.add_class ( µ.DOM.select selector ), 'has-fallback-glyphs' ), selector
  #.........................................................................................................
  echo CND.grey "—".repeat 108
  return R

#-----------------------------------------------------------------------------------------------------------
show_global_font_stats = ( page ) ->
  doc             = await get_ppt_doc_object page
  ### thx to https://stackoverflow.com/a/47914111/7568091 ###
  ### TAINT unfortunately these stats are not quite reliable and appear to hinge on quite particular
  circumstances, such that font statistics for a given element may or may not include the stats for
  contained elements. Until a better method has been found, the only reliable way to catch all missing
  glyphs is to query *all* DOM nodes. FTTB we look into the `<artboard/>` element. ###
  raw_font_stats  = await _raw_font_stats_from_selector page, doc, 'artboard'
  R               = []
  glyph_total     = raw_font_stats.reduce ( ( acc, d ) -> acc + d.glyphCount ), 0
  raw_font_stats.sort ( a, b ) -> - ( a.glyphCount - b.glyphCount )
  fallbacks       = []
  echo CND.grey "—".repeat 108
  echo CND.grey "^interplot/show_global_font_stats@55432^"
  echo CND.steel "Global Font Statistics:"
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
  # unless isa.empty fallbacks
  unless isa.empty selectors = await mark_elements_with_fallback_glyphs page
    echo CND.red CND.reverse CND.bold " Fallback fonts detected: #{fallbacks.join ', '} "
    echo CND.red "in DOM nodes: #{ ( jr d for d in selectors ).join ', '} "
  #.........................................................................................................
  echo CND.grey "—".repeat 108
  return R

#-----------------------------------------------------------------------------------------------------------
profile = ( page, f ) ->
  await page.tracing.start { path: '.cache/trace.json', }
  await f()
  await page.tracing.stop()

#-----------------------------------------------------------------------------------------------------------
demo_2 = ->
  ### TAINT get path from configuration? ###
  URL             = require 'url'
  path            = PATH.resolve PATH.join __dirname, '../../public/demo-galley/main.html'
  url             = ( URL.pathToFileURL path ).href
  target_selector = '#page-ready'
  #.........................................................................................................
  # Set up browser and page.
  urge "launching browser";
  # browser = await PUPPETEER.launch settings.puppeteer
  browser_settings            = settings[ settings.use_profile ? 'puppeteer' ]
  browser                     = await PUPPETEER.launch browser_settings
  page                        = await get_page browser
  #.........................................................................................................
  page.on 'error', ( error ) => throw error
  page.on 'console', echo_browser_console
  #.........................................................................................................
  # media = 'print'                                       ### OK ###
  # urge "emulate media: #{rpr media}"
  # debug '^4432^', await page.evaluate -> ( matchMedia 'print' ).matches
  # await page.emulateMediaType media
  # debug '^4432^', await page.evaluate -> ( matchMedia 'print' ).matches
  # await page._client.send 'Emulation.clearDeviceMetricsOverride'
  # # await page.emulateMedia null
  # # page.setViewport settings.viewport
  # # await page.emulate PUPPETEER.devices[ 'iPhone 6' ]
  # # await page.emulate PUPPETEER.devices[ 'Galaxy Note 3 landscape' ]
  #.........................................................................................................
  urge "goto #{url}"
  await page.goto url
  #.........................................................................................................
  urge "waitForSelector"
  await page.waitForSelector target_selector
  # #.........................................................................................................
  await page.exposeFunction 'TEMPLATES_slug_as_html',     ( P... ) => ( require '../templates' ).slug_as_html P...
  # await page.exposeFunction 'TEMPLATES_pointer',  ( P... ) => ( require '../templates' ).pointer  P...
  #.........................................................................................................
  # await profile page, -> await demo_insert_slabs page
  await demo_insert_slabs page
  #.........................................................................................................
  computed_style  = await computed_styles_from_selector page, 'slug'
  # info '^8887^', jr styles.verdicts
  urge '^8887^', "border-left-color:    ", computed_style[ 'border-left-color'    ]
  urge '^8887^', "outline-width:        ", computed_style[ 'outline-width'        ]
  urge '^8887^', "background-color:     ", computed_style[ 'background-color'     ]
  urge '^8887^', "background-repeat-x:  ", computed_style[ 'background-repeat-x'  ]
  urge '^8887^', "foo:                  ", computed_style[ 'foo'                  ]
  urge '^8887^', "dang:                 ", computed_style[ 'dang'                 ]
  #.........................................................................................................
  await show_global_font_stats page
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
  text                = ( require './sample-texts' )[ 7 ]
  text                = ( text + ' ' ).repeat 1
  slabs_dtm           = LINEMAKER.slabs_from_text text
  validate.interplot_slabs_datom slabs_dtm
  # html    = await page.evaluate ( ( slabs_dtm ) -> OPS.demo_insert_slabs slabs_dtm ), slabs_dtm
  XXX_settings        = { min_slab_idx: 0, }
  t0 = Date.now()
  slugs_with_metrics  = await OPS_slugs_with_metrics_from_slabs page, slabs_dtm, XXX_settings
  dt = Date.now() - t0
  # for d in slugs_with_metrics
  #   info '^53566^', "slugs_with_metrics", jr d
  debug '^22332^', "dt: #{format_float dt / 1000} s"
  return null


############################################################################################################
if module is require.main then do =>
  # await sleep 5
  await demo_2()
  help 'ok'
  if settings.puppeteer.headless
    process.exit 0 ### needed? ###


