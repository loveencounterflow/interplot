
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


#-----------------------------------------------------------------------------------------------------------
HTML.$html_as_datoms = ->
  return $ ( buffer_or_text, send ) =>
    send d for d in HTML.html_as_datoms buffer_or_text
    return null

#-----------------------------------------------------------------------------------------------------------
INTERTEXT.$as_lines = ( settings ) ->
  ### TAINT implement settings to configure what to do if data is not text ###
  return $ ( x, send ) ->
    send if ( isa.text x ) then x + '\n' else x
    return null

#-----------------------------------------------------------------------------------------------------------
DATAMILL = {}
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

#-----------------------------------------------------------------------------------------------------------
DEMO = {}

#-----------------------------------------------------------------------------------------------------------
DEMO.$grab_first_paragraph = ->
  p_count   = 0
  within_p  = false
  return $ ( d, send ) =>
    return send.end() if p_count >= 1
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

#-----------------------------------------------------------------------------------------------------------
DEMO.$consolidate_text = ->
  ### TAINT use SP.$collect() ?? ###
  last      = Symbol 'last'
  collector = []
  return $ { last, }, ( d, send ) =>
    return send collector.join '' if d is last
    validate.text d
    collector.push d

#-----------------------------------------------------------------------------------------------------------
@f = -> new Promise ( resolve ) =>
  source_path = PATH.resolve PATH.join __dirname, '../../sample-data/sample-text.html'
  pipeline    = []
  source      = SP.read_from_file source_path
  not_a_text  = ( d ) -> not isa.text d
  pipeline.push source
  pipeline.push SP.$split() ### TAINT implement `$split()` w/ newline/whitespace-preserving ###
  pipeline.push INTERTEXT.$as_lines()
  pipeline.push DATAMILL.$stop_on_stop_tag()
  pipeline.push $ { leapfrog: not_a_text, }, HTML.$html_as_datoms()
  pipeline.push DEMO.$grab_first_paragraph()
  pipeline.push DEMO.$filter_text()
  pipeline.push DEMO.$consolidate_text()
  pipeline.push $show()
  pipeline.push $drain =>
    resolve()
  SP.pull pipeline...
  return null


############################################################################################################
if module is require.main then do =>
  await @f()
  help 'ok'


