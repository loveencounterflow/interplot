
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

#-----------------------------------------------------------------------------------------------------------
_.DEBUGONOFF = ->
  _.BUTTON '#debugonoff', "dbg"
  _.COFFEESCRIPT ->
    ( $ document ).ready -> ( $ '#debugonoff' ).on 'click', -> ( $ 'body' ).toggleClass 'debug'

#-----------------------------------------------------------------------------------------------------------
_.SLUG = _.new_tag ( nr, width ) ->
  ### validate arity, nr, width ###
  trim_id         = "trim#{nr}"
  slug_id         = "slug#{nr}"
  # left_flag_id    = "lflag#{nr}"
  # right_flag_id   = "rflag#{nr}"
  style = "max-width:#{width};"
  _.TAG 'slug', { id: slug_id, style, }, ->
    # _.FLAG { id: left_flag_id, }
    _.TRIM { id: trim_id, contenteditable: 'true', }
    # _.FLAG { id: right_flag_id, }

#-----------------------------------------------------------------------------------------------------------
_.GALLEY = _.new_tag ( width ) ->
  style = "max-width:#{width};"
  _.TAG 'galley', { id: 'galley1', style, }, ->
    for nr in [ 1 .. 100 ]
      _.SLUG nr, '150mm'

#-----------------------------------------------------------------------------------------------------------
_.GAUGE = _.new_tag ->
  style   = ''
  style  += "display:block;position:absolute;top:10mm;left:0mm;"
  style  += "width:10mm;min-width:10mm;max-width:10mm;"
  style  += "height:10mm;min-height:10mm;max-height:10mm;"
  style  += "background: repeating-linear-gradient(-45deg,#606dbc80,#606dbc80 10px,#46529880 10px,#46529880 20px);"
  _.COFFEESCRIPT ->
    ( $ document ).ready ->
      #.....................................................................................................
      f = ->
        cmgauge_jq    = $ 'gauge'
        @px_per_mm    = cmgauge_jq.width() / 10
        @mm_per_px    = 1 / @px_per_mm
        @px_from_mm   = ( mm    ) -> mm * @px_per_mm
        @mm_from_px   = ( px    ) -> px * @mm_per_px
        @width_mm_of  = ( node  ) -> @mm_from_px ( as_dom_node node ).getBoundingClientRect().width
      #.....................................................................................................
      f.apply globalThis.GAUGE = {}
      return null
  _.TAG 'gauge', { style, }

#-----------------------------------------------------------------------------------------------------------
_.selector_generator = ->
  _.JS  '../fczbkk-css-selector-generator.js' ### https://github.com/fczbkk/css-selector-generator ###
  _.COFFEESCRIPT ->
    ( $ document ).ready ->
      sg = new CssSelectorGenerator;
      globalThis.selector_of = ( node ) -> sg.getSelector as_dom_node node
      return null

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
    _.JS  resolve './ops-plotter.js' ### TAINT `resolve()` not defined here ###
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
    _.selector_generator()
    _.CSS './galley.css'
    _.GAUGE()
    _.DEBUGONOFF()
    #.......................................................................................................
    _.GALLEY '150mm'
    #.......................................................................................................
    _.TAG 'demo-paragraph', { contenteditable: 'true', }, """
      自馮瀛王"""
    #.......................................................................................................
    _.TAG 'demo-paragraph', { contenteditable: 'true', }, """
      ䷼䷽䷾䷿䷼䷽䷾䷿䷼䷽おきみつおきかずこううんじおきひでこうえいおきながカキクケオイロハニオヘトキュウカッパダッテ
      亥核帝六今令户戶京立音言主文一丁丂國七丄種从虫䜌聲한국어조선말ABC123縉鄑戬戩虚虛嘘噓墟任廷呈程草花
      敬寬茍苟慈没殁沒歿芟投般咎昝晷倃卧臥虎微秃丸常當尚尙區陋沿匚匡亡匸匿龍祗萬禽宫宮侣營麻術述刹新案
      條寨甚商罕深差茶採某也的害編真直值縣祖概鄉者良鬼龜過骨為爲益温溫穴空舟近雞食搵絕丟丢曾𠔃兮清前有
      半平內内羽非邦亠詽訮刊方兌兑马馬
      あいうえおか〇〡〢〣〤〥〦〧〨〩〸〹〺㐀㐁㐂一丁丂豈更車並况全𗀀𗀁𗀂𘠄𘠅𘠆𘠇𘠈𘠉𘠊𛅰𛅱𛅲𛅳
      ⾱⾲⾳⾴
      其法用膠泥刻字，薄如錢唇，每字為一印，火燒令堅。先設一鐵版，其上以松脂臘和紙灰之類冒之。
      其法用膠泥刻字、^薄如錢唇、^每字為一印、^火燒令堅。先設一鐵版、^其上以松脂臘和紙灰之類冒之。
      Yaffir rectangle刻文字apostolary. Letterpress printing is a technique of relief printing using a printing press.
      自馮瀛王始印五經已後典籍皆為版本其法用膠泥刻字
      """
    #.......................................................................................................
    _.TAG 'galley', { style: "max-width: 150mm", }, ->
      _.TAG 'slug', { style: "max-width: 150mm", }, ->
        ### thx to https://stackoverflow.com/a/30526943/7568091 ###
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
    _.TAG 'demo-paragraph', { contenteditable: 'true', }, -> for [ 0 .. 3 ] then _.RAW """
      <strong style='color:red;'>galley</strong> <em>(n.)</em> 13c., "sea&shy;going ves&shy;sel ha&shy;ving
      both sails and oars," from Old French ga&shy;lie, ga&shy;lee "boat, war&shy;ship, gal&shy;ley," from
      Medi&shy;eval Latin ga&shy;lea or Ca&shy;ta&shy;lan ga&shy;lea, from Late Greek ga&shy;lea, of
      un&shy;known ori&shy;gin. The word has made its way into most Wes&shy;tern Eu&shy;ro&shy;pe&shy;an
      lan&shy;gua&shy;ges. Ori&shy;gi&shy;nal&shy;ly "low, flat-built sea&shy;going ves&shy;sel of one
      deck," once a com&shy;mon type in the Me&shy;di&shy;ter&shy;ra&shy;ne&shy;an. Mean&shy;ing
      "cook&shy;ing range or cook&shy;ing room on a ship" dates from 1750. The prin&shy;t&shy;ing sense of
      gal&shy;ley, "ob&shy;long tray that holds the type once set," is from 1650s, from French ga&shy;lée in
      the same sense, in re&shy;f&shy;er&shy;en&shy;ce to the shape of the tray. As a short form of
      galley-proof it is at&shy;tes&shy;ted from 1890. """
  return insert layout, content




# debug ( k for k of _ ).sort().join ' '; process.exit 1

