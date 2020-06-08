
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
#...........................................................................................................
DATOM                     = new ( require 'datom' ).Datom { dirty: false, }
{ new_datom
  lets
  select }                = DATOM.export()
#...........................................................................................................
types                     = require './types'
{ isa
  validate
  type_of }               = types
#...........................................................................................................
INTERTEXT                 = require 'intertext'
{ HTML }                  = INTERTEXT
{ datoms_as_html
  raw
  text
  script
  css
  dhtml }                 = HTML.export()
H                         = dhtml
@elements = E             = require './template-elements'


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@layout = ( settings ) ->
  public_path         = PATH.resolve PATH.join __dirname, '../public'
  #.........................................................................................................
  defaults            =
    title:        'INTERPLOT'
    base_path:    public_path
    body_def:     '' # may contain CSS-selector-like string, e.g. '.default', '#bodyid42.foo.bar'
    head:         []
    body:         []
  #.........................................................................................................
  settings            = { defaults..., settings..., }
  settings.base_path  = PATH.resolve settings.base_path
  resolve             = ( path ) => PATH.relative settings.base_path, PATH.join public_path, path
  ### -------------------------------------------------------------------------------------------------- ###
  head                = []
  head.push H 'meta', charset: 'utf-8'
  # head.push ( H 'meta', 'http-equiv': "Content-Security-Policy", content: "default-src 'self'"          )
  # head.push ( H 'meta', 'http-equiv': "Content-Security-Policy", content: "script-src 'unsafe-inline'"  )
  head.push H 'title', settings.title
  head.push script  resolve './jquery-3.4.1.js'
  head.push css     resolve './jquery-ui-1.12.1/jquery-ui.min.css'
  head.push script  resolve './jquery-ui-1.12.1/jquery-ui.min.js'
  head.push script  resolve './ops-globals.js'
  head.push script  resolve './ops.js'
  head.push script  resolve './intertext.js'
  head.push css     resolve './reset.css'
  head.push css     resolve './styles.css'
  head.push settings.head
  ### -------------------------------------------------------------------------------------------------- ###
  body                = []
  body.push E.unstyledelement()
  body.push E.gauge()
  body.push E.toolbox()
  body.push settings.body
  body.push H 'span#page-ready'
  ### -------------------------------------------------------------------------------------------------- ###
  page = [ ( H 'doctype' ), ( H 'head', head ), ( H 'body', body ), ]
  return page

#-----------------------------------------------------------------------------------------------------------
@demo_galley = ->
  unless ( arity = arguments.length ) is 0
    throw new Error "^33211^ expected 0 arguments, got #{arity}"
  base_path       = PATH.resolve PATH.join __dirname, '../public/demo-galley'
  title           = 'Galley Demo'
  body_def        = '.debug'
  #.........................................................................................................
  head            = []
  head.push E.dom_element_selector_generator()
  head.push css './galley.css'
  #.........................................................................................................
  body            = [
    E.artboard { id: 'artboard1', class: 'pages', }, [
      E.zoomer [
        E.page { pagenr: 1, }, [
          E.topmargin()
          E.hbox [
            E.leftmargin()
            E.column() # E.pointer()
            E.vgap()
            E.column()
            E.vgap()
            E.column()
            E.rightmargin() ]
          E.bottommargin() ], ], ], ]
  #.........................................................................................................
  layout_settings = { title, base_path, head, body_def, body, }
  return datoms_as_html @layout layout_settings

# #...........................................................................................................
# info datoms_as_html @layout { title: "Galley Demo", content: H 'foobar' }
# urge @demo_galley()

# debug '^9087^'; process.exit 1

###
Rulers
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
###

# #-----------------------------------------------------------------------------------------------------------
# @___OLD__demo_galley = ->
#         _.PAGE { pagenr: 1, }, ->
#           _.TOPMARGIN()
#           _.HBOX ->
#             _.LEFTMARGIN()
#             _.COLUMN()
#             _.VGAP()
#             _.COLUMN()
#             _.VGAP()
#             _.COLUMN()
#             _.RIGHTMARGIN()
#           _.BOTTOMMARGIN()
#         # #.......................................................................................................
#         # _.PAGE { pagenr: 3, }, ->
#         #   _.GALLEY    { width: '150mm', slugcount: 25,  empty: true, }
#         #.......................................................................................................
#         _.PAGE { pagenr: 4, }, ->
#           _.TAG 'demo-paragraph', { id: 'd1', contenteditable: 'true', }, """
#             自馮瀛王"""
#         #.......................................................................................................
#         _.PAGE { pagenr: 5, }, ->
#           #.......................................................................................................
#           _.TAG 'demo-paragraph', { id: 'd2', contenteditable: 'true', }, """
#             ䷼䷽䷾䷿䷼䷽䷾䷿䷼䷽おきみつおきかずこううんじおきひでこうえいおきながカキクケオイロハニオヘトキュウカッパダッテ
#             亥核帝六今令户戶京立音言主文一丁丂國七丄種从虫䜌聲한국어조선말ABC123縉鄑戬戩虚虛嘘噓墟任廷呈程草花
#             敬寬茍苟慈没殁沒歿芟投般咎昝晷倃卧臥虎微秃丸常當尚尙區陋沿匚匡亡匸匿龍祗萬禽宫宮侣營麻術述刹新案
#             條寨甚商罕深差茶採某也的害編真直值縣祖概鄉者良鬼龜過骨為爲益温溫穴空舟近雞食搵絕丟丢曾𠔃兮清前有
#             半平內内羽非邦亠詽訮刊方兌兑马馬
#             あいうえおか〇〡〢〣〤〥〦〧〨〩〸〹〺㐀㐁㐂一丁丂豈更車並况全𗀀𗀁𗀂𘠄𘠅𘠆𘠇𘠈𘠉𘠊𛅰𛅱𛅲𛅳
#             ⾱⾲⾳⾴
#             其法用膠泥刻字，薄如錢唇，每字為一印，火燒令堅。先設一鐵版，其上以松脂臘和紙灰之類冒之。
#             其法用膠泥刻字、^薄如錢唇、^每字為一印、^火燒令堅。先設一鐵版、^其上以松脂臘和紙灰之類冒之。
#             Yaffir rectangle刻文字apostolary. Letterpress printing is a technique of relief printing using a printing press.
#             自馮瀛王始印五經已後典籍皆為版本其法用膠泥刻字
#             """
#         #.......................................................................................................
#         _.PAGE { pagenr: 6, }, ->
#           #.......................................................................................................
#           _.TAG 'galley', { style: "max-width: 150mm", }, ->
#             _.TAG 'slug', { style: "max-width: 150mm", }, ->
#               ### thx to https://stackoverflow.com/a/30526943/7568091 ###
#               _.TAG 'trim', { style: "display:flex;", contenteditable: 'true', }, ->
#                 _.RAW '自'
#                 _.TAG 'g'
#                 _.RAW '馮'
#                 _.TAG 'g'
#                 _.RAW '瀛'
#                 _.TAG 'g'
#                 _.RAW '王'
#                 # _.RAW '始'
#                 # _.RAW '印'
#                 # _.RAW '五'
#                 # _.RAW '經'
#                 # _.RAW '已'
#                 # _.RAW '後'
#                 # _.RAW '典'
#                 # _.RAW '籍'
#                 # _.RAW '皆'
#                 # _.RAW '為'
#                 # _.RAW '版'
#                 # _.RAW '本'
#                 # _.RAW '其'
#                 # _.RAW '法'
#                 # _.RAW '用'
#                 # _.RAW '膠'
#                 # _.RAW '泥'
#                 # _.RAW '刻'
#                 # _.RAW '字'
#         #.......................................................................................................
#         _.PAGE { pagenr: 7, }, ->
#           #.......................................................................................................
#           _.TAG 'demo-paragraph', { id: 'd3', contenteditable: 'true', }, -> for [ 0 .. 3 ] then _.RAW """
#             <strong style='color:red;'>galley</strong> <em>(n.)</em> 13c., "sea&shy;going ves&shy;sel
#             ha&shy;ving both sails and oars," from Old French ga&shy;lie, ga&shy;lee "boat, war&shy;ship,
#             gal&shy;ley," from Medi&shy;eval Latin ga&shy;lea or Ca&shy;ta&shy;lan ga&shy;lea, from Late
#             Greek ga&shy;lea, of un&shy;known ori&shy;gin. The <span style='font-size:300%'>word</span> has
#             made its way into most Wes&shy;tern Eu&shy;ro&shy;pe&shy;an lan&shy;gua&shy;ges.
#             Ori&shy;gi&shy;nal&shy;ly "low, flat-built sea&shy;going ves&shy;sel of one deck," once a
#             com&shy;mon type in the Me&shy;di&shy;ter&shy;ra&shy;ne&shy;an. Mean&shy;ing "cook&shy;ing range
#             or cook&shy;ing room on a ship" dates from 1750. The prin&shy;t&shy;ing sense of gal&shy;ley,
#             "ob&shy;long tray that holds the type once set," is from 1650s, from French ga&shy;lée in the
#             same sense, in re&shy;f&shy;er&shy;en&shy;ce to the shape of the tray. As a short form of
#             galley-proof it is at&shy;tes&shy;ted from 1890. """
#         #.......................................................................................................
#         _.PAGE { pagenr: 8, }
#         _.PAGE { pagenr: 9, }
#         _.PAGE { pagenr: 10, }
#   #.........................................................................................................
#   return insert layout, content



