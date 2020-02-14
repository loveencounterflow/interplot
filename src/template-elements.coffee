
# cannot 'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr.bind CND
badge                     = 'INTERPLOT/TEMPLATE-ELEMENTS'
log                       = CND.get_logger 'plain',     badge
info                      = CND.get_logger 'info',      badge
whisper                   = CND.get_logger 'whisper',   badge
alert                     = CND.get_logger 'alert',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
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

# #-----------------------------------------------------------------------------------------------------------
# tag_registry = {}
# id_from_tagname = ( tagname ) ->
#   count = tag_registry[ tagname ] = ( tag_registry[ tagname ] ?= 0 ) + 1
#   return "#{tagname}#{count}"

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
### Unique elements: ###
@unstyledelement = ( P... ) -> [ ( H 'unstyledelement#unstyledelement',  P... ), ]
@tabletop        = ( P... ) -> [ ( H 'tabletop#tabletop',                P... ), ]
@zoomer          = ( P... ) -> [ ( H 'zoomer#zoomer',                    P... ), ]
@pointer         = ( P... ) -> [ ( H 'pointer#pointer',                  P... ), ]
#-----------------------------------------------------------------------------------------------------------
@grid            = ( P... ) -> [ ( H 'grid',                             P... ), ]
@artboard        = ( P... ) -> [ ( H 'artboard',                         P... ), ]
@artboard        = ( P... ) -> [ ( H 'artboard',                         P... ), ]
#...........................................................................................................
@box             = ( P... ) -> [ ( H 'box',                              P... ), ]
@hbox            = ( P... ) -> [ ( H 'hbox',                             P... ), ]
@hgap            = ( P... ) -> [ ( H 'hgap',                             P... ), ]
@vbox            = ( P... ) -> [ ( H 'vbox',                             P... ), ]
@vgap            = ( P... ) -> [ ( H 'vgap',                             P... ), ]
@xhgap           = ( P... ) -> [ ( H 'xhgap',                            P... ), ]
@topmargin       = ( P... ) -> [ ( H 'topmargin',                        P... ), ]
@bottommargin    = ( P... ) -> [ ( H 'bottommargin',                     P... ), ]
@leftmargin      = ( P... ) -> [ ( H 'leftmargin',                       P... ), ]
@rightmargin     = ( P... ) -> [ ( H 'rightmargin',                      P... ), ]
@column          = ( P... ) -> [ ( H 'column',                           P... ), ]
@slug            = ( P... ) -> [ ( H 'slug', @trim(),                    P... ), ]
@trim            = ( P... ) -> [ ( H 'trim',                             P... ), ]

#-----------------------------------------------------------------------------------------------------------
@dom_element_selector_generator = ->
  ### https://github.com/fczbkk/css-selector-generator ###
  return [
    #.......................................................................................................
    ( script '../fczbkk-css-selector-generator.js' ) ### TAINT path not properly resolved ###
      script ->
        ( $ document ).ready ->
          sg = new CssSelectorGenerator;
          globalThis.selector_of = ( node ) -> sg.getSelector as_dom_node node
          return null
    #.......................................................................................................
    ]

#-----------------------------------------------------------------------------------------------------------
@toolbox = ->
  R = []
  R.push script -> ( $ document ).ready ->
    globalThis.toolbox    = {}
    toolbox.debugonoff_jq = debugonoff_jq = $ '#debugonoff'
    toolbox.zoomin_jq     = zoomin_jq     = $ '#zoomin'
    toolbox.zoomout_jq    = zoomout_jq    = $ '#zoomout'
    toolbox.zoomer_jq     = zoomer_jq     = $ '#zoomer'
    # zoomer_jq.css 'transform-origin', "top left"
    #.......................................................................................................
    debugonoff_jq.on 'click', -> ( $ 'body' ).toggleClass 'debug'
    #.......................................................................................................
    ### TAINT should use CSS animations ###
    zoomin_jq.on 'click', ->
      current_zoom = parseFloat zoomer_jq.css 'zoom'
      zoomer_jq.animate { zoom: current_zoom * 1.25, }, 150, 'linear'
    #.......................................................................................................
    zoomout_jq.on 'click', ->
      # zoomer_jq.css 'transform-origin', "top left"
      current_zoom = parseFloat zoomer_jq.css 'zoom'
      zoomer_jq.animate { zoom: current_zoom / 1.25, }, 150, 'linear'
    #.......................................................................................................
    return null
  R.push H 'toolbox.gui', [
    H 'button#debugonoff.gui', "dbg"
    H 'button#zoomout.gui',    "z–"
    H 'button#zoomin.gui',     "z+" ]
  return R

#-----------------------------------------------------------------------------------------------------------
@page = ( settings, content ) ->
  defaults  = { pagenr: 0, }
  settings  = { defaults..., settings..., }
  id        = "page#{settings.pagenr}"
  leftright = if ( isa.even settings.pagenr ) then 'left' else 'right'
  page      = []
  page.push H 'earmark', "#{settings.pagenr}"
  page.push H 'paper'
  page.push H 'chase', content
  return H "page##{id}.#{leftright}", page

#-----------------------------------------------------------------------------------------------------------
@gauge = ->
  R = []
  R.push H 'style', """
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
    @media print{ gauge#gauge { display: none; } }"""
  #.........................................................................................................
  R.push script -> ( $ document ).ready ->
    f = ->
      cmgauge_jq    = $ 'gauge#gauge'
      @px_per_mm    = cmgauge_jq.width() / 10
      @mm_per_px    = 1 / @px_per_mm
      @px_from_mm   = ( mm    ) -> mm * @px_per_mm
      @mm_from_px   = ( px    ) -> px * @mm_per_px
      @width_mm_of  = ( node  ) -> @mm_from_px ( as_dom_node node ).getBoundingClientRect().width
      @height_mm_of = ( node  ) -> @mm_from_px ( as_dom_node node ).getBoundingClientRect().height
    f.apply globalThis.GAUGE = {}
    return null
  #.........................................................................................................
  R.push H 'gauge#gauge.gui.draggable'
  return R

