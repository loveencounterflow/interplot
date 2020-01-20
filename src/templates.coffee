
# cannot 'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr.bind CND
badge                     = '明快打字机/TEMPLATES'
log                       = CND.get_logger 'plain',     badge
info                      = CND.get_logger 'info',      badge
whisper                   = CND.get_logger 'whisper',   badge
alert                     = CND.get_logger 'alert',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
#...........................................................................................................
# MKTS                      = require './main'
PATH                      = require 'path'
FS                        = require 'fs'
TEACUP                    = require 'coffeenode-teacup'
# CHR                       = require 'coffeenode-chr'
#...........................................................................................................
# _STYLUS                   = require 'stylus'
# as_css                    = STYLUS.render.bind STYLUS
# style_route               = PATH.join __dirname, '../src/mingkwai-typesetter.styl'
# css                       = as_css FS.readFileSync style_route, encoding: 'utf-8'
#...........................................................................................................

#===========================================================================================================
# TEACUP NAMESPACE ACQUISITION
#-----------------------------------------------------------------------------------------------------------
_ = TEACUP

# #-----------------------------------------------------------------------------------------------------------
_.TABLETOP            = _.new_tag ( P... ) -> _.TAG 'tabletop',     P...
_.GRID                = _.new_tag ( P... ) -> _.TAG 'grid',         P...
_.PAGE                = _.new_tag ( P... ) -> _.TAG 'page',         P...
# _.FULLHEIGHTFULLWIDTH = _.new_tag ( P... ) -> _.TAG 'fullheightfullwidth', P...
# _.OUTERGRID           = _.new_tag ( P... ) -> _.TAG 'outergrid',           P...
# _.LEFTBAR             = _.new_tag ( P... ) -> _.TAG 'leftbar',             P...
# _.CONTENT             = _.new_tag ( P... ) -> _.TAG 'content',             P...
# _.RIGHTBAR            = _.new_tag ( P... ) -> _.TAG 'rightbar',            P...
# _.SHADE               = _.new_tag ( P... ) -> _.TAG 'shade',               P...
# _.SCROLLER            = _.new_tag ( P... ) -> _.TAG 'scroller',            P...
# _.BOTTOMBAR           = _.new_tag ( P... ) -> _.TAG 'bottombar',           P...
# _.FOCUSFRAME          = _.new_tag ( P... ) -> _.TAG 'focusframe',          P...
#...........................................................................................................
_.JS                   = _.new_tag ( route ) -> _.SCRIPT type: 'text/javascript',  src: route
_.CSS                  = _.new_tag ( route ) -> _.LINK   rel:  'stylesheet',      href: route
# _.STYLUS               = ( source ) -> _.STYLE {}, _STYLUS.render source
#...........................................................................................................
_.FLAG                 = _.new_tag ( P... ) -> _.TAG 'flag', P...
_.TRIM                 = _.new_tag ( P... ) -> _.TAG 'trim', P...
#...........................................................................................................
_.SLUG = _.new_tag ( nr, width ) ->
  ### validate arity, nr, width ###
  trim_id         = "trim#{nr}"
  slug_id         = "slug#{nr}"
  left_flag_id    = "lflag#{nr}"
  right_flag_id   = "rflag#{nr}"
  style = "max-width:#{width};"
  _.TAG 'slug', { id: slug_id, style, }, ->
    _.FLAG { id: left_flag_id, }
    _.TRIM { id: trim_id, contenteditable: 'true', }
    _.FLAG { id: right_flag_id, }
#...........................................................................................................
_.GALLEY = _.new_tag ( width ) ->
  style = "max-width:#{width};"
  _.TAG 'galley', { id: 'galley1', style, }, ->
    for nr in [ 1 .. 100 ]
      _.SLUG nr, '150mm'

#-----------------------------------------------------------------------------------------------------------
insert = ( layout, content ) -> layout.replace /%content%/g, content

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
# @get_flexgrid_html = ( cdtsel_nr, term ) ->
#   selector = if cdtsel_nr is 1 then '.cdtsel' else ''
#   ### TAINT use API to derive cdtsel_id ###
#   return @render => _.DIV "#candidate-#{cdtsel_nr}.glyph#{selector}", term

#-----------------------------------------------------------------------------------------------------------
@layout = ( settings ) ->
  ### TAINT use intertype for defaults ###
  public_path         = PATH.resolve PATH.join __dirname, '../public'
  defaults            =
    title:        'INTERPLOT'
    base_path:    public_path
    body_def:     '' # may contain CSS-selector-like string, e.g. '.default', '#bodyid42.foo.bar'
  settings            = { defaults..., settings..., }
  settings.base_path  = PATH.resolve settings.base_path
  resolve             = ( path ) => PATH.relative settings.base_path, PATH.join public_path, path
  #.........................................................................................................
  return _.render =>
    _.DOCTYPE 5
    _.META charset: 'utf-8'
    # _.META 'http-equiv': "Content-Security-Policy", content: "default-src 'self'"
    # _.META 'http-equiv': "Content-Security-Policy", content: "script-src 'unsafe-inline'"
    _.TITLE settings.title
    ### ------------------------------------------------------------------------------------------------ ###
    _.JS  resolve './jquery-3.3.1.js'
    _.JS  resolve './ops-globals.js'
    _.JS  resolve './ops.js'
    _.JS  resolve './ops-plotter.js'
    _.CSS resolve './reset.css'
    _.CSS resolve './styles.css'
    ### ------------------------------------------------------------------------------------------------ ###
    ### LIBRARIES                                                                                       ###
    # _.JS  'http://d3js.org/d3.v4.js'
    # _.JS  'http://d3js.org/d3.v5.js'
    # _.JS   './d3.v5.js'
    # _.JS   'https://cdn.jsdelivr.net/npm/taucharts@2/dist/taucharts.min.js'
    # _.CSS  'https://cdn.jsdelivr.net/npm/taucharts@2/dist/taucharts.min.css'
    # _.CSS './c3-0.6.14/c3.css'
    # _.JS  './c3-0.6.14/c3.min.js'
    #=======================================================================================================
    _.BODY settings.body_def, ->
      _.RAW '\n\n%content%\n\n'
      _.SPAN '#page-ready'
    return null

#-----------------------------------------------------------------------------------------------------------
@main_2 = ->
  unless ( arity = arguments.length ) is 0
    throw new Error "^33211^ expected 0 arguments, got #{arity}"
  layout  = @layout 'Triangular Chart'
  content = _.render =>
    _.JS   'https://cdn.plot.ly/plotly-latest.min.js'
    _.CSS  './chart-styles.css'
    _.CSS  'https://fonts.googleapis.com/css?family=Lobster'
    _.DIV '#chart'
    return null
  return insert layout, content

#-----------------------------------------------------------------------------------------------------------
@tabletop = ( page_count ) -> _.render =>
  _.TABLETOP =>
    _.GRID '.foo', =>
      _.PAGE =>
        '%content%'

#-----------------------------------------------------------------------------------------------------------
@demo_columns = ->
  unless ( arity = arguments.length ) is 0
    throw new Error "^33211^ expected 0 arguments, got #{arity}"
  demo_path     = PATH.resolve PATH.join __dirname, '../public/demo-columns'
  content_path  = PATH.join demo_path, 'content.html'
  layout        = @layout { title: 'Columns Demo', base_path: ( PATH.resolve demo_path ), }
  tabletop      = insert layout, @tabletop 4
  extras        = _.render =>
    _.CSS './styles.css'
  content       = FS.readFileSync content_path, { encoding: 'utf-8', }
  return insert tabletop, extras + content

#-----------------------------------------------------------------------------------------------------------
@demo_galley = ->
  unless ( arity = arguments.length ) is 0
    throw new Error "^33211^ expected 0 arguments, got #{arity}"
  base_path       = PATH.resolve PATH.join __dirname, '../public/demo-galley'
  title           = 'Galley Demo'
  body_def      = '.debug'
  layout_settings = { title, base_path, body_def, }
  layout          = @layout layout_settings
  # tabletop        = insert layout, @tabletop 4
  content         = _.render =>
    _.CSS './galley.css'
    #.......................................................................................................
    _.BUTTON '#debugonoff', "dbg"
    _.COFFEESCRIPT ->
      ( $ document ).ready ->
        ( $ '#debugonoff' ).on 'click', -> ( $ 'body' ).toggleClass 'debug'
    #.......................................................................................................
    _.TAG 'galley', { style: "max-width: 150mm", }, ->
      _.TAG 'slug', { style: "max-width: 150mm", }, ->
        _.TAG 'trim', { style: "display:flex;", contenteditable: 'true', }, ->
          _.RAW '自'
          _.TAG 'g'
          _.RAW '馮'
          _.TAG 'g'
          _.RAW '瀛'
          _.TAG 'g'
          _.RAW '王'
          # _.RAW '始'
          # _.RAW '印'
          # _.RAW '五'
          # _.RAW '經'
          # _.RAW '已'
          # _.RAW '後'
          # _.RAW '典'
          # _.RAW '籍'
          # _.RAW '皆'
          # _.RAW '為'
          # _.RAW '版'
          # _.RAW '本'
          # _.RAW '其'
          # _.RAW '法'
          # _.RAW '用'
          # _.RAW '膠'
          # _.RAW '泥'
          # _.RAW '刻'
          # _.RAW '字'
    #.......................................................................................................
    _.GALLEY '150mm'
  return insert layout, content




# debug ( k for k of _ ).sort().join ' '; process.exit 1

