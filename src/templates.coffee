
# cannot 'use strict'


############################################################################################################
njs_path                  = require 'path'
njs_fs                    = require 'fs'
#...........................................................................................................
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
TEACUP                    = require 'coffeenode-teacup'
# CHR                       = require 'coffeenode-chr'
#...........................................................................................................
# _STYLUS                   = require 'stylus'
# as_css                    = STYLUS.render.bind STYLUS
# style_route               = njs_path.join __dirname, '../src/mingkwai-typesetter.styl'
# css                       = as_css njs_fs.readFileSync style_route, encoding: 'utf-8'
#...........................................................................................................

#===========================================================================================================
# TEACUP NAMESPACE ACQUISITION
#-----------------------------------------------------------------------------------------------------------
Object.assign @, TEACUP

# #-----------------------------------------------------------------------------------------------------------
# @FULLHEIGHTFULLWIDTH  = @new_tag ( P... ) -> @TAG 'fullheightfullwidth', P...
# @OUTERGRID            = @new_tag ( P... ) -> @TAG 'outergrid',           P...
# @LEFTBAR              = @new_tag ( P... ) -> @TAG 'leftbar',             P...
# @CONTENT              = @new_tag ( P... ) -> @TAG 'content',             P...
# @RIGHTBAR             = @new_tag ( P... ) -> @TAG 'rightbar',            P...
# @SHADE                = @new_tag ( P... ) -> @TAG 'shade',               P...
# @SCROLLER             = @new_tag ( P... ) -> @TAG 'scroller',            P...
# @BOTTOMBAR            = @new_tag ( P... ) -> @TAG 'bottombar',           P...
# @FOCUSFRAME           = @new_tag ( P... ) -> @TAG 'focusframe',          P...
#...........................................................................................................
@JS                   = @new_tag ( route ) -> @SCRIPT type: 'text/javascript',  src: route
@CSS                  = @new_tag ( route ) -> @LINK   rel:  'stylesheet',      href: route
# @STYLUS               = ( source ) -> @STYLE {}, _STYLUS.render source


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
# @get_flexgrid_html = ( cdtsel_nr, term ) ->
#   selector = if cdtsel_nr is 1 then '.cdtsel' else ''
#   ### TAINT use API to derive cdtsel_id ###
#   return @render => @DIV "#candidate-#{cdtsel_nr}.glyph#{selector}", term

#-----------------------------------------------------------------------------------------------------------
@main_2 = ->
  #.........................................................................................................
  return @render =>
    @DOCTYPE 5
    @META charset: 'utf-8'
    # @META 'http-equiv': "Content-Security-Policy", content: "default-src 'self'"
    # @META 'http-equiv': "Content-Security-Policy", content: "script-src 'unsafe-inline'"
    @TITLE 'INTERPLOT'
    ### ------------------------------------------------------------------------------------------------ ###
    # @JS     './jquery-3.3.1.js'
    # @CSS    './reset.css'
    # @CSS    './styles-01.css'
    ### ------------------------------------------------------------------------------------------------ ###
    ### LIBRARIES                                                                                       ###
    @JS  'http://d3js.org/d3.v4.js'
    # @JS  'http://d3js.org/d3.v5.js'
    # @CSS 'file:///home/flow/io/interplot/public/c3-0.6.14/c3.css'
    # @JS  'file:///home/flow/io/interplot/public/c3-0.6.14/c3.min.js'
    #=======================================================================================================
    @DIV '#my_dataviz'
    @DIV '#chart'
    @JS  './ops.js'
    return null





