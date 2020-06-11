
# cannot 'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr.bind CND
badge                     = 'INTERPLOT/TEMPLATES'
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
URL                       = require 'url'
# CHR                       = require 'coffeenode-chr'
#...........................................................................................................
# _STYLUS                   = require 'stylus'
# as_css                    = STYLUS.render.bind STYLUS
# style_route               = PATH.join __dirname, '../src/mingkwai-typesetter.styl'
# css                       = as_css FS.readFileSync style_route, encoding: 'utf-8'
#...........................................................................................................
### NOTE starting migration to `Cupofhtml` b/c of `&quote` bug in teacup ###
INTERTEXT                 = require 'intertext'
{ HTML }                  = INTERTEXT
cupofhtml                 = new HTML.Cupofhtml { flatten: true, }
SCRIPT = ( f ) ->
  # validate.function f
  cupofhtml.script f
  return HTML.html_from_datoms cupofhtml.expand()


#===========================================================================================================
# TEACUP NAMESPACE ACQUISITION
#-----------------------------------------------------------------------------------------------------------
_ = TEACUP

# #-----------------------------------------------------------------------------------------------------------
_.TABLETOP            = _.new_tag ( P... ) -> _.TAG 'tabletop',     P...
_.GRID                = _.new_tag ( P... ) -> _.TAG 'grid',         P...
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
_.JS                   = _.new_tag ( route ) -> _.SCRIPT type: 'text/javascript', src:  route
# _.MJS                  = _.new_tag ( route ) -> _.SCRIPT type: 'module',          src:  ( URL.pathToFileURL route ).href
_.CSS                  = _.new_tag ( route ) -> _.LINK   rel:  'stylesheet',      href: route
# _.STYLUS               = ( source ) -> _.STYLE {}, _STYLUS.render source
#...........................................................................................................
_.ARTBOARD             = _.new_tag ( P... ) -> _.TAG 'artboard',  P...
_.ZOOMER               = _.new_tag ( P... ) -> _.TAG 'zoomer',    P...
#...........................................................................................................
_.BOX                   = _.new_tag ( P... ) -> _.TAG 'box',            P...
_.HBOX                  = _.new_tag ( P... ) -> _.TAG 'hbox',           P...
_.HGAP                  = _.new_tag ( P... ) -> _.TAG 'hgap',           P...
_.VBOX                  = _.new_tag ( P... ) -> _.TAG 'vbox',           P...
_.VGAP                  = _.new_tag ( P... ) -> _.TAG 'vgap',           P...
_.XHGAP                 = _.new_tag ( P... ) -> _.TAG 'xhgap',          P...
_.TOPMARGIN             = _.new_tag ( P... ) -> _.TAG 'topmargin',      P...
_.BOTTOMMARGIN          = _.new_tag ( P... ) -> _.TAG 'bottommargin',   P...
_.LEFTMARGIN            = _.new_tag ( P... ) -> _.TAG 'leftmargin',     P...
_.RIGHTMARGIN           = _.new_tag ( P... ) -> _.TAG 'rightmargin',    P...
_.COLUMN                = _.new_tag ( P... ) -> _.TAG 'column',         P...


#-----------------------------------------------------------------------------------------------------------
_.TOOLBOX = ->
  SCRIPT ->
    ( $ document ).ready ->
      globalThis.toolbox    = {}
      toolbox.debugonoff_jq = debugonoff_jq = $ '#debugonoff'
      toolbox.zoomin_jq     = zoomin_jq     = $ '#zoomin'
      toolbox.zoomout_jq    = zoomout_jq    = $ '#zoomout'
      toolbox.zoomer_jq     = zoomer_jq     = $ '#zoomer'
      # zoomer_jq.css 'transform-origin', "top left"
      #.....................................................................................................
      debugonoff_jq.on 'click', -> ( $ 'body' ).toggleClass 'debug'
      #.....................................................................................................
      ### TAINT should use CSS animations ###
      zoomin_jq.on 'click', ->
        current_zoom = parseFloat zoomer_jq.css 'zoom'
        zoomer_jq.animate { zoom: current_zoom * 1.25, }, 150, 'linear'
      #.....................................................................................................
      zoomout_jq.on 'click', ->
        # zoomer_jq.css 'transform-origin', "top left"
        current_zoom = parseFloat zoomer_jq.css 'zoom'
        zoomer_jq.animate { zoom: current_zoom / 1.25, }, 150, 'linear'
      #.....................................................................................................
      return null
  _.TAG 'toolbox', '.gui', ->
    _.BUTTON '#debugonoff.gui', "dbg"
    _.BUTTON '#zoomout.gui',    "z–"
    _.BUTTON '#zoomin.gui',     "z+"

#-----------------------------------------------------------------------------------------------------------
_.CARET   = @caret    = _.new_tag -> _.TAG 'caret'
_.TRIM    = @trim     = _.new_tag -> _.TAG 'trim', -> _.CARET()
_.SLUG    = @slug     = _.new_tag -> _.TAG 'slug', -> _.TRIM()
_.POINTER = @pointer  = _.new_tag -> _.TAG 'pointer', '#pointer'

#-----------------------------------------------------------------------------------------------------------
_.UNSTYLEDELEMENT = _.new_tag -> _.TAG 'unstyledelement'
  # _.TAG 'slug', -> _.TRIM { contenteditable: 'true', }

#-----------------------------------------------------------------------------------------------------------
tag_registry = {}
id_from_tagname = ( tagname ) ->
  count = tag_registry[ tagname ] = ( tag_registry[ tagname ] ?= 0 ) + 1
  return "#{tagname}#{count}"

#-----------------------------------------------------------------------------------------------------------
_._SLUGCONTAINER = _.new_tag ( tagname, settings ) ->
  defaults =
    width:      '150mm'
    style:      null
    slugcount:  2
    empty:      false
  ### TAINT validate settings ###
  settings  = { defaults..., settings..., }
  style     = "max-width:#{settings.width};" + ( settings.style ? '' )
  if settings.empty
    ### TAINT lineheight false assumed to be 10mm ###
    height  = "#{settings.slugcount * 10}mm"
    style  += "height:#{height};max-height:#{height};"
  id        = id_from_tagname tagname
  _.TAG tagname, { id, style, 'data-slugcount': settings.slugcount, }, ->
    unless settings.empty
      for nr in [ 1 .. settings.slugcount ] by +1
        _.SLUG()
  return null

#-----------------------------------------------------------------------------------------------------------
_.PAGE = ( settings, content ) ->
  defaults  = { pagenr: 0, }
  settings  = { defaults..., settings..., }
  id        = "page#{settings.pagenr}"
  clasz     = if ( settings.pagenr %% 2 is 0 ) then 'left' else 'right'
  _.TAG 'page', { id, class: clasz, }, ->
    _.TAG 'earmark', -> "#{settings.pagenr}"
    _.TAG 'paper'
    _.TAG 'chase', ->
      if ( typeof content ) is 'function'
        content()

#-----------------------------------------------------------------------------------------------------------
_.GALLEY    = _.new_tag ( settings ) -> _._SLUGCONTAINER 'galley',    settings

#-----------------------------------------------------------------------------------------------------------
_.GAUGE = _.new_tag ->
  _.STYLE """
    gauge#gauge {
      display:                block;
      position:               absolute;
      top:                    10mm;
      left:                   0mm;
      width:                  10mm;
      min-width:              10mm;
      max-width:              10mm;
      height:                 10mm;
      min-height:             10mm;
      max-height:             10mm;
      mix-blend-mode:         multiply;
      backdrop-filter:        blur(0.2mm);
      background-color:       #ab2865; }
    @media print{ gauge#gauge { display: none; } }\n"""
  SCRIPT ->
    ( $ document ).ready ->
      #.....................................................................................................
      f = ->
        cmgauge_jq    = $ 'gauge#gauge'
        @px_per_mm    = cmgauge_jq.width() / 10
        @mm_per_px    = 1 / @px_per_mm
        @px_from_mm   = ( mm    ) -> mm * @px_per_mm
        @mm_from_px   = ( px    ) -> px * @mm_per_px
        @width_mm_of  = ( node  ) -> @mm_from_px ( as_dom_node node ).getBoundingClientRect().width
        @height_mm_of = ( node  ) -> @mm_from_px ( as_dom_node node ).getBoundingClientRect().height
      #.....................................................................................................
      f.apply globalThis.GAUGE = {}
      return null
  _.TAG 'gauge', '#gauge.gui.draggable'

#-----------------------------------------------------------------------------------------------------------
_.selector_generator = ->
  _.JS  '../fczbkk-css-selector-generator.js' ### https://github.com/fczbkk/css-selector-generator ###
  SCRIPT ->
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
    _.JS  resolve './jquery-3.4.1.js'
    _.CSS resolve './jquery-ui-1.12.1/jquery-ui.min.css'
    _.JS  resolve './jquery-ui-1.12.1/jquery-ui.min.js'
    _.JS  resolve './plink-plonk.js'
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
  content         = _.render =>
    _.selector_generator()
    _.CSS './galley.css'
    # SCRIPT ->
    #   ( $ window ).on 'resize', ( event ) ->
    #     log '^29000^', "resize", event
    #     log window.devicePixelRatio
    #     window.devicePixelRatio = 1
    #     # ( $ '#zoomer' ).css 'zoom', 1 / window.devicePixelRatio
    #     event.preventDefault()
    #     return false
    #.......................................................................................................
    _.UNSTYLEDELEMENT(); _.GAUGE(); _.TOOLBOX()
    #.......................................................................................................
    _.ARTBOARD '#artboard1.pages', ->
      _.ZOOMER '#zoomer', ->
        # _style = "background-color:#ff0b;z-index:100;position:absolute;"
        _.DIV '.draggable.dropshadow', { style: "position:absolute;z-index:100;mix-blend-mode:multiply;backdrop-filter:blur(0.2mm);background-color:yellow;width:300mm;height:20mm;left:31mm;top:17mm", }, ->
          _.IMG { src: '../rulers/hruler.png', style: "mix-blend-mode:multiply;", }
        _.DIV '.draggable.dropshadow', { style: "position:absolute;z-index:100;mix-blend-mode:multiply;backdrop-filter:blur(0.2mm);background-color:yellow;width:20mm;height:300mm;left:8mm;top:40mm", }, ->
          _.IMG { src: '../rulers/vruler.png', style: "mix-blend-mode:multiply;", }
        _.COFFEESCRIPT ->
          ( $ document ).ready ->
            ( $ '.draggable' ).draggable()
            ( $ '.draggable' ).on 'focus', -> ( $ @ ).blur()
        # _.TAG 'page', { pagenr: 0, }
        #.......................................................................................................
        _.PAGE { pagenr: 1, }, ->
          _.TOPMARGIN()
          _.HBOX ->
            _.LEFTMARGIN()
            _.COLUMN()
            _.VGAP()
            _.COLUMN()
            _.VGAP()
            _.COLUMN()
            _.RIGHTMARGIN()
          _.BOTTOMMARGIN()
        # #.......................................................................................................
        # _.PAGE { pagenr: 3, }, ->
        #   _.GALLEY    { width: '150mm', slugcount: 25,  empty: true, }
        #.......................................................................................................
        _.PAGE { pagenr: 4, }, ->
          _.TAG 'demo-paragraph', { id: 'd1', contenteditable: 'true', }, """
            自馮瀛王"""
        #.......................................................................................................
        _.PAGE { pagenr: 5, }, ->
          #.......................................................................................................
          _.TAG 'demo-paragraph', { id: 'd2', contenteditable: 'true', }, """
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
        _.PAGE { pagenr: 6, }, ->
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
        _.PAGE { pagenr: 7, }, ->
          #.......................................................................................................
          _.TAG 'demo-paragraph', { id: 'd3', contenteditable: 'true', }, -> for [ 0 .. 3 ] then _.RAW """
            <strong style='color:red;'>galley</strong> <em>(n.)</em> 13c., "sea&shy;going ves&shy;sel
            ha&shy;ving both sails and oars," from Old French ga&shy;lie, ga&shy;lee "boat, war&shy;ship,
            gal&shy;ley," from Medi&shy;eval Latin ga&shy;lea or Ca&shy;ta&shy;lan ga&shy;lea, from Late
            Greek ga&shy;lea, of un&shy;known ori&shy;gin. The <span style='font-size:300%'>word</span> has
            made its way into most Wes&shy;tern Eu&shy;ro&shy;pe&shy;an lan&shy;gua&shy;ges.
            Ori&shy;gi&shy;nal&shy;ly "low, flat-built sea&shy;going ves&shy;sel of one deck," once a
            com&shy;mon type in the Me&shy;di&shy;ter&shy;ra&shy;ne&shy;an. Mean&shy;ing "cook&shy;ing range
            or cook&shy;ing room on a ship" dates from 1750. The prin&shy;t&shy;ing sense of gal&shy;ley,
            "ob&shy;long tray that holds the type once set," is from 1650s, from French ga&shy;lée in the
            same sense, in re&shy;f&shy;er&shy;en&shy;ce to the shape of the tray. As a short form of
            galley-proof it is at&shy;tes&shy;ted from 1890. """
        #.......................................................................................................
        _.PAGE { pagenr: 8, }
        _.PAGE { pagenr: 9, }
        _.PAGE { pagenr: 10, }
  #.........................................................................................................
  return insert layout, content




# debug ( k for k of _ ).sort().join ' '; process.exit 1

