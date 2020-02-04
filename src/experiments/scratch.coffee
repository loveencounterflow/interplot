
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'INTERPLOT/SCRATCH'
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
types                     = require '../types'
{ isa
  validate
  cast
  type_of }               = types
#...........................................................................................................
# DATOM                     = new ( require 'datom' ).Datom { dirty: false, }
DATOM                     = require 'datom'
{ new_datom
  stamp
  lets
  select }                = DATOM.export()
#...........................................................................................................
SP                        = require 'steampipes'
# SP                        = require '../../apps/steampipes'
{ $
  $async
  $drain
  $watch
  $show  }                = SP.export()
#...........................................................................................................
after                     = ( dts, f ) -> setTimeout f, dts * 1000
sleep                     = ( dts ) -> new Promise ( done ) -> after dts, done
# page_html_path            = PATH.resolve PATH.join __dirname, '../../../public/main.html'
LINEMAKER                 = require '../linemaker'
# PUPPETEER                 = require 'puppeteer'
INTERTEXT                 = require 'intertext'
{ HTML, }                 = INTERTEXT
#...........................................................................................................
RC                        = require '../remote-control'
DATAMILL                  = {}
DEMO                      = {}
INTERPLOT                 = {}
_settings                 = DATOM.freeze require '../settings'


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
HTML.$html_as_datoms = ->
  return $ ( buffer_or_text, send ) =>
    send d for d in HTML.html_as_datoms buffer_or_text
    return null


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
INTERTEXT.$as_lines = ( settings ) ->
  ### TAINT implement settings to configure what to do if data is not text ###
  return $ ( x, send ) ->
    send if ( isa.text x ) then x + '\n' else x
    return null


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
DATAMILL.$stop_on_stop_tag = ->
  has_stopped = false
  line_nr     = 0
  return $ ( line, send ) =>
    return if has_stopped
    line_nr++
    if /^\s*<stop\/>/.test line
      has_stopped = true
      send new_datom '^stop', $: { line_nr, }
      return send.end()
    send line


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
DEMO.$grab_first_paragraphs = ->
  p_count   = 0
  within_p  = false
  return $ ( d, send ) =>
    return send.end() if p_count >= 2
    switch d.$key
      when '<p'
        within_p = true
        send d
      when '>p'
        within_p = false
        p_count++
        send d
      else
        return send d if within_p
    return null

#-----------------------------------------------------------------------------------------------------------
DEMO.$filter_text = ->
  return $ ( d, send ) =>
    return unless select d, '^text'
    send d.text

# #-----------------------------------------------------------------------------------------------------------
# DEMO.$consolidate_text = ->
#   ### TAINT use SP.$collect() ?? ###
#   last      = Symbol 'last'
#   collector = []
#   return $ { last, }, ( d, send ) =>
#     return send collector.join '' if d is last
#     validate.text d
#     collector.push d

#-----------------------------------------------------------------------------------------------------------
DEMO.$blockify = ->
  last      = Symbol 'last'
  collector = []
  return $ { last, }, ( d, send ) =>
    if d is last
      text = collector.join ''
      return send new_datom '^mkts:block', { text, }
    validate.text d
    collector.push d

#-----------------------------------------------------------------------------------------------------------
DEMO.$hyphenate = ->
  return $ ( d, send ) =>
    return send d unless select d, '^mkts:block'
    send lets d, ( d ) => d.text = INTERTEXT.HYPH.hyphenate d.text

#-----------------------------------------------------------------------------------------------------------
DEMO.$as_slabs = ->
  return $ ( d, send ) =>
    return send d unless select d, '^mkts:block'
    send stamp d
    send new_datom '^slabs', INTERTEXT.SLABS.slabs_from_text d.text
    # send lets d, ( d ) => d.text = INTERTEXT.hyphenate d.text


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
provide_interplot_extensions = ->

  #-----------------------------------------------------------------------------------------------------------
  @$launch = ( S ) ->
    has_launched      = false
    url               = 'file:///home/flow/jzr/interplot/public/demo-galley/main.html'
    wait_for_selector = '#page-ready'
    gui               = true
    #.........................................................................................................
    return $async ( d, send, done ) =>
      send stamp d
      unless has_launched
        urge "launching browser..."
        S.rc = await RC.new_remote_control { url, wait_for_selector, gui, }
        #.....................................................................................................
        ### TAINT how to best expose libraries in browser context? ###
        await S.rc.page.exposeFunction 'TEMPLATES_slug',     ( P... ) => ( require '../templates' ).slug     P...
        await S.rc.page.exposeFunction 'TEMPLATES_pointer',  ( P... ) => ( require '../templates' ).pointer  P...
        #.....................................................................................................
        urge "browser launched"
      return done()

  #-----------------------------------------------------------------------------------------------------------
  @$f = ( settings ) ->
    ### TAINT how to avoid repeated validation of settings? ###
    return $async ( d, send, done ) =>
      #.......................................................................................................
      # help "^3342^ output written to #{settings.path}"
      send stamp d
      return done()

  #-----------------------------------------------------------------------------------------------------------
  @$text_as_pdf = ( S ) ->
    validate.nonempty_text  S.target_path
    #..........................................................................................................
    pipeline  = []
    pipeline.push @$launch S
    pipeline.push @$f()
    #..........................................................................................................
    return SP.pull pipeline...

  #-----------------------------------------------------------------------------------------------------------
  ### TAINT put into browser interface module ###
  @get_page = ( browser ) ->
    if isa.empty ( pages = await browser.pages() )
      urge "µ29923-2 new page";           R = await browser.newPage()
    else
      urge "µ29923-2 use existing page";  R = pages[ 0 ]
    return R

provide_interplot_extensions.apply INTERPLOT

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@f = -> new Promise ( resolve ) =>
  S =
    settings:     lets _settings, ( d ) -> assign d, headless: false
    browser:      null
    page:         null
  #.........................................................................................................
  S.sample_home = PATH.resolve PATH.join __dirname, '../../sample-data'
  S.source_path = PATH.join S.sample_home, 'sample-text.html'
  S.target_path = PATH.join S.sample_home, 'sample-text.pdf'
  pipeline      = []
  source        = SP.read_from_file S.source_path
  not_a_text    = ( d ) -> not isa.text d
  #.........................................................................................................
  pipeline.push source                                           ### ↓↓↓ arbitrarily chunked buffers ↓↓↓ ###
  ### TAINT implement `$split()` w/ newline/whitespace-preserving ###
  #.........................................................................................................
  pipeline.push SP.$split()                                                    ### ↓↓↓ lines of text ↓↓↓ ###
  pipeline.push INTERTEXT.$as_lines()
  pipeline.push DATAMILL.$stop_on_stop_tag()
  #.........................................................................................................
  pipeline.push $ { leapfrog: not_a_text, }, HTML.$html_as_datoms()
  pipeline.push DEMO.$grab_first_paragraphs()
  pipeline.push DEMO.$filter_text()
  # pipeline.push DEMO.$consolidate_text()
  pipeline.push DEMO.$blockify()                                         ### ↓↓↓ text/HTML of blocks ↓↓↓ ###
  pipeline.push DEMO.$hyphenate()
  pipeline.push DEMO.$as_slabs()                                         ### ↓↓↓ slabs ↓↓↓ ###
  #.........................................................................................................
  # pipeline.push INTERPLOT.$text_as_pdf S
  pipeline.push $show()
  #.........................................................................................................
  pipeline.push $drain =>
    resolve()
  SP.pull pipeline...
  return null


############################################################################################################
if module is require.main then do =>
  await @f()
  help 'ok'


