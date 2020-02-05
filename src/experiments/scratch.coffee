
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
INTERTEXT.$append = ( text ) ->
  validate.text text
  return $ ( x, send ) ->
    send if ( isa.text x ) then x + text else x
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
  leapfrog = ( d, send, done ) ->
    ### NOTE Helper function to slightly simplify quick exit from (async) transforms; used to make up for
    the still missing `{ leapfrog, }` modifier for `$async` transforms. Does very little but helps to mark
    those points where the modifier would have been used. Usage:

    ```coffee
    $t = -> $async ( d, send, done ) =>
      return ( leapfrog d, send, done ) unless select d, '^key-i'm-waiting-for
      ...
    ```
    ###
    send d
    done()

  #-----------------------------------------------------------------------------------------------------------
  @$launch = ( S ) ->
    ### TAINT settings to be passed in via `S`? ###
    url               = 'file:///home/flow/jzr/interplot/public/demo-galley/main.html'
    wait_for_selector = '#page-ready'
    gui               = true
    #.........................................................................................................
    @$XXX_issue_launch_cmd = ( S ) ->
      ### NOTE replace with modifiers to `$launch()` when available for async transforms ###
      first = Symbol 'first'
      return $ { first, }, ( d, send ) =>
        return send d unless d is first
        send new_datom '^interplot:launch-browser'
    #.........................................................................................................
    @$XXX_launch_proper = ( S ) ->
      return $async ( d, send, done ) =>
        unless select d, '^interplot:launch-browser'
          send d
          return done()
        urge "launching browser..."
        S.rc = await RC.new_remote_control { url, wait_for_selector, gui, }
        urge "browser launched"
        #.....................................................................................................
        ### TAINT how to best expose libraries in browser context? ###
        await S.rc.page.exposeFunction 'TEMPLATES_slug',     ( P... ) => ( require '../templates' ).slug     P...
        await S.rc.page.exposeFunction 'TEMPLATES_pointer',  ( P... ) => ( require '../templates' ).pointer  P...
        #.....................................................................................................
        send new_datom '^interplot:browser-ready'
        return done()
    #.........................................................................................................
    pipeline  = []
    pipeline.push @$XXX_issue_launch_cmd  S
    pipeline.push @$XXX_launch_proper     S
    return SP.pull pipeline...

  #-----------------------------------------------------------------------------------------------------------
  @$find_first_target_element = ( S ) ->
    return $async ( d, send, done ) =>
      return ( leapfrog d, send, done ) unless select d, '^interplot:browser-ready'
      send d
      selector = 'column:first' # 'column:nth(0)'
      send new_datom '^interplot:first-target-element', { selector, }
      return done()

  #-----------------------------------------------------------------------------------------------------------
  @$text_as_pdf = ( S ) ->
    ###
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

    ###
    validate.nonempty_text  S.target_path
    #..........................................................................................................
    pipeline  = []
    pipeline.push @$launch                      S
    pipeline.push @$find_first_target_element   S
    #..........................................................................................................
    return SP.pull pipeline...

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
  # source        = SP.read_from_file S.source_path
  source        = await SP._KLUDGE_file_as_buffers S.source_path
  not_a_text    = ( d ) -> not isa.text d
  #.........................................................................................................
  pipeline.push source                                           ### ↓↓↓ arbitrarily chunked buffers ↓↓↓ ###
  #.........................................................................................................
  ### TAINT implement `$split()` w/ newline/whitespace-preserving ###
  pipeline.push SP.$split()                                                    ### ↓↓↓ lines of text ↓↓↓ ###
  pipeline.push DATAMILL.$stop_on_stop_tag()
  pipeline.push INTERTEXT.$append '\n'
  #.........................................................................................................
  pipeline.push $ { leapfrog: not_a_text, }, HTML.$html_as_datoms()
  pipeline.push DEMO.$grab_first_paragraphs()
  pipeline.push DEMO.$filter_text()
  # pipeline.push DEMO.$consolidate_text()
  pipeline.push DEMO.$blockify()                                         ### ↓↓↓ text/HTML of blocks ↓↓↓ ###
  pipeline.push DEMO.$hyphenate()
  pipeline.push DEMO.$as_slabs()                                                       ### ↓↓↓ slabs ↓↓↓ ###
  #.........................................................................................................
  pipeline.push INTERPLOT.$text_as_pdf S
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


