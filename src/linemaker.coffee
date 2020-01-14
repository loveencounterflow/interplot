
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'INTERPLOT/GENERATE-PDF'
debug                     = CND.get_logger 'debug',     badge
alert                     = CND.get_logger 'alert',     badge
whisper                   = CND.get_logger 'whisper',   badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
info                      = CND.get_logger 'info',      badge
PATH                      = require 'path'
FS                        = require 'fs'
{ jr, }                   = CND
assign                    = Object.assign
join_path                 = ( P... ) -> PATH.resolve PATH.join P...
#...........................................................................................................
types                     = require './types'
{ isa
  validate
  cast
  type_of }               = types


#-----------------------------------------------------------------------------------------------------------
@demo_linebreak = ->
  LineBreaker = require 'linebreak'
  keep_hyphen = String.fromCodePoint 0x2011
  shy         = String.fromCodePoint 0x00ad
  nbsp        = String.fromCodePoint 0x00a0
  text        = "Super-cali#{keep_hyphen}frag#{shy}ilistic\nis#{nbsp}a (wonder(ful)) word我很喜歡這個單字。"
  breaker = new LineBreaker text
  last = 0
  ### LBO: line break opportunity ###
  while ( lbo = breaker.nextBreak() )?
    # get the string between the last break and this one
    word  = text.slice last, lbo.position
    xhy   = if isa.interplot_shy word then ( CND.gold '-' ) else ''
    rq    = if lbo.required then '!' else ' '
    info rq, ( jr word ), xhy
    last = lbo.position
  return null


############################################################################################################
if module is require.main then do =>
  @demo_linebreak()



