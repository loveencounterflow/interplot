
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
  $before_first
  $once_async_before_first
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

progress = ( P... ) -> echo ( CND.cyan p for p in P )...

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
$XXX_datoms_from_html = ->
  return $ ( x, send ) ->
    progress '^P1^', rpr x
    if x is '<p>A concise introduction to the things discussed below.</p>\n'
      send freeze { $key: '<p', }
      send freeze { $key: '^text', text: "(simulated) A concise introduction to the things discussed below." }
      send freeze { $key: '>p', }

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
    gui               = false
    gui               = true
    #.........................................................................................................
    return $once_async_before_first ( send, done ) =>
      progress '^P2^', "INTERPLOT_extensions.$launch"
      send new_datom '^interplot:launch-browser'
      urge "launching browser..."
      S.rc = await RC.new_remote_control { url, wait_for_selector, gui, }
      urge "browser launched"
      #.....................................................................................................
      ### TAINT how to best expose libraries in browser context? ###
      await S.rc.page.exposeFunction 'TEMPLATES_slug',     ( P... ) => ( require '../template-elements' ).slug     P...
      await S.rc.page.exposeFunction 'TEMPLATES_pointer',  ( P... ) => ( require '../template-elements' ).pointer  P...
      await S.rc.page.evaluate ->
        ( $ document ).ready ->
          console.log '^scratch/launch@6745^', 'TEMPLATES_slug()', await TEMPLATES_slug()
          console.log '^scratch/launch@6745^', 'TEMPLATES_pointer()', await TEMPLATES_pointer()
      debug '^scratch/$launch@883^', "slug():",     ( require '../template-elements' ).slug
      debug '^scratch/$launch@883^', "pointer():",  ( require '../template-elements' ).pointer
      #.....................................................................................................
      send new_datom '^interplot:browser-ready'
      return done()

  #-----------------------------------------------------------------------------------------------------------
  @$find_first_target_element = ( S ) ->
    return $async ( d, send, done ) =>
      return ( leapfrog d, send, done ) unless select d, '^interplot:browser-ready'
      progress '^P3^', "INTERPLOT_extensions.$find_first_target_element"
      send d
      selector = 'column' # 'column:nth(0)'
      # debug '^22298^', await S.rc.page.$ selector
      # debug '^22298^', await S.rc.page.$ 'column'
      opsf = ( selector ) -> ### NOTE: OPSF = On-Page Script Function ###
        ### TAINT race condition or can we rely on page ready? ###
        # ( $ document ).ready ->
        globalThis.xxx_target_elements = $ selector
        console.log '^scratch/find_first_target_element@3987^', "xxx_target_elements:", xxx_target_elements[ 0 ]
        return globalThis.xxx_target_elements?.length
      column_count = await S.rc.page.evaluate opsf, selector
      debug '^scratch/find_first_target_element@22298^', "found #{column_count} elements for #{rpr { selector, }}"
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
    pipeline.push $watch ( d ) -> whisper '^scratch/$text_as_pdf@334', d
    #..........................................................................................................
    progress '^P4^', "INTERPLOT_extensions.$text_as_pdf"
    return SP.pull pipeline...

provide_interplot_extensions.apply INTERPLOT

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@f = -> new Promise ( resolve ) =>
  #.........................................................................................................
  process.on 'SIGINT', ->
    ### Make sure browser is closed gracefully so as to continue in previous state and avoid "do you want to
    restore" dialog. This solution works sometimes but not always. ###
    warn "Caught interrupt signal"
    await S.rc.page.close { runBeforeUnload: true, }
    await S.rc.browser.close()
    process.exit()
  #.........................................................................................................
  S =
    settings:     lets _settings, ( d ) -> assign d, headless: false
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
  pipeline.push $ { leapfrog: not_a_text, }, $XXX_datoms_from_html()
  pipeline.push $watch ( d ) -> progress '^P5^', "(pipeline) #{rpr d}"
  pipeline.push DEMO.$grab_first_paragraphs()
  pipeline.push DEMO.$filter_text()
  # pipeline.push DEMO.$consolidate_text()
  pipeline.push DEMO.$blockify()                                         ### ↓↓↓ text/HTML of blocks ↓↓↓ ###
  pipeline.push DEMO.$hyphenate()
  pipeline.push DEMO.$as_slabs()                                                       ### ↓↓↓ slabs ↓↓↓ ###
  #.........................................................................................................
  pipeline.push INTERPLOT.$text_as_pdf S
  pipeline.push $show { title: '--334-->', }
  #.........................................................................................................
  pipeline.push $drain =>
    resolve()
  progress '^P6^', "f"
  SP.pull pipeline...
  return null


############################################################################################################
if module is require.main then do =>
  #.........................................................................................................
  await @f()
  # settings =
  #   product:          'firefox'
  #   headless:         false
  #   executablePath:   '/usr/bin/firefox'
  # await ( require 'puppeteer' ).launch settings
  help 'ok'




