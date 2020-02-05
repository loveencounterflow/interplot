

'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'INTERPLOT/REMOTE-CONTROL'
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
# join_path                 = ( P... ) -> PATH.resolve PATH.join P...
#...........................................................................................................
types                     = require './types'
{ isa
  validate
  cast
  type_of }               = types
# #...........................................................................................................
# # DATOM                     = new ( require 'datom' ).Datom { dirty: false, }
# DATOM                     = require 'datom'
# { new_datom
#   stamp
#   lets
#   select }                = DATOM.export()
# #...........................................................................................................
# SP                        = require 'steampipes'
# # SP                        = require '../../apps/steampipes'
# { $
#   $async
#   $drain
#   $watch
#   $show  }                = SP.export()
# #...........................................................................................................
# after                     = ( dts, f ) -> setTimeout f, dts * 1000
# sleep                     = ( dts ) -> new Promise ( done ) -> after dts, done
# # page_html_path            = PATH.resolve PATH.join __dirname, '../../../public/main.html'
# LINEMAKER                 = require '../linemaker'
# # PUPPETEER                 = require 'puppeteer'
# INTERTEXT                 = require 'intertext'
# { HTML, }                 = INTERTEXT
# #...........................................................................................................
# DATAMILL                  = {}
# DEMO                      = {}
# INTERPLOT                 = {}
# _settings                 = DATOM.freeze require '../settings'
PUPPETEER                 = require 'puppeteer'
### NOTE consider to use https://github.com/TehShrike/deepmerge ###
merge                     = require 'lodash.merge'

#-----------------------------------------------------------------------------------------------------------
@_echo_browser_console = ( c ) =>
  linenr      = c._location?.lineNumber ? '?'
  path        = c._location?.url        ? '???'
  short_path  = path
  if ( match = path.match /^file:\/\/(?<path>.+)$/ )?
    short_path = PATH.relative process.cwd(), PATH.resolve FS.realpathSync match.groups.path
  path        = short_path unless short_path.startsWith '../'
  location    = "#{path}:#{linenr}"
  text        = c._text ? '???'
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
@get_old_or_new_page = ( me ) ->
  return await me.browser.newPage() if isa.empty ( pages = await me.browser.pages() )
  return pages[ 0 ]

#-----------------------------------------------------------------------------------------------------------
@new_remote_control = ( settings ) ->
  R                           = {}
  settings                    = merge {}, ( require './settings' ), settings
  settings.puppeteer.headless = not settings.gui ? true
  R.browser                   = await PUPPETEER.launch settings.puppeteer
  R.page                      = await @get_old_or_new_page R
  page_loaded                 = new Promise ( resolve ) => R.page.once 'load', => resolve()
  await R.page.goto settings.url if settings.url?
  await page_loaded
  await R.page.waitForSelector settings.wait_for_selector if settings.wait_for_selector?
  #.........................................................................................................
  R.page.on 'error', ( error ) => throw error
  R.page.on 'console', @_echo_browser_console
  #.........................................................................................................
  return R



###
@resize_window = ( width, height ) ->
  # thx to https://gist.github.com/garywu/bcb9259da58c1e70044355b77c9e1078
  # see https://github.com/Codeception/CodeceptJS/issues/973
    await this.page.setViewport({height, width});
    // Window frame - probably OS and WM dependent.
    height += 85;
    // Any tab.
    const {targetInfos: [{targetId}]} = await this.browser._connection.send(
      'Target.getTargets'
    );
    // Tab window.
    const {windowId} = await this.browser._connection.send(
      'Browser.getWindowForTarget',
      {targetId}
    );
    // Resize.
    await this.browser._connection.send('Browser.setWindowBounds', {
      bounds: {height, width},
      windowId
###


