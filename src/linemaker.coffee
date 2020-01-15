
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
SP                        = require 'steampipes'
{ $
  $drain }                = SP.export()

#-----------------------------------------------------------------------------------------------------------
provide_hyphenation = ->
  createHyphenator  = require 'hyphen'
  patterns          = require 'hyphen/patterns/en-us'
  hyphenate = createHyphenator patterns #, { hyphenChar: '-', }

  #-----------------------------------------------------------------------------------------------------------
  @hyphenate = ( text ) -> hyphenate text
provide_hyphenation.apply HYPH = {}

# #-----------------------------------------------------------------------------------------------------------
# @hyphenate_2 = ( text ) ->
#   { hyphenated, } = require 'hyphenated'
#   R               = hyphenated text
#   return R.replace /\u00ad/g, '-'

# #-----------------------------------------------------------------------------------------------------------
# xxx = null
# @hyphenate_3 = ( text ) ->
#   hyphenopoly = require 'hyphenopoly'
#   hyphenator  = hyphenopoly.config {
#       require:    [ 'de', 'en-us', ]
#       hyphen:     '-',
#       exceptions: { 'en-us': 'en-han-ces', }
#   hyphenate = await hyphenator.get 'en-us'
#   async function hyphenate_en(text) {
#       console.log(hyphenateText(text));
#   }

#-----------------------------------------------------------------------------------------------------------
@demo_hyphenation = ->
  texts = [
    "typesetting"
    "supercalifragilistic"
    "phototypesetter"
    "hairstylist"
    "gargantuan"
    "the lopsided honeybadger"
    ]
  for text in texts
    htext = HYPH.hyphenate text
    htext = htext.replace /\u00ad/g, '-'
    info htext
  return null

#-----------------------------------------------------------------------------------------------------------
@demo_compare_hyphenators = -> new Promise ( done ) =>
  count1    = 0
  count2    = 0
  pipeline  = []
  pipeline.push SP.read_from_file '/etc/dictionaries-common/words'
  pipeline.push SP.$split()
  pipeline.push SP.$filter ( word ) -> word.length > 0
  pipeline.push SP.$watch ( word ) =>
    t1 = @hyphenate_1 word
    t2 = @hyphenate_2 word
    return if t1 is t2
    count1 += ( t1.replace /[^-]/g, '' ).length
    count2 += ( t2.replace /[^-]/g, '' ).length
    info ( CND.lime t1 ), ( CND.gold t2 )
  # pipeline.push SP.$show()
  pipeline.push $drain ->
    info ( CND.lime count1 ), ( CND.gold count2 )
    done()
  SP.pull pipeline...
  return null


#-----------------------------------------------------------------------------------------------------------
@demo_linebreak = ->
  LineBreaker = require 'linebreak'
  keep_hyphen = String.fromCodePoint 0x2011
  shy         = String.fromCodePoint 0x00ad
  nbsp        = String.fromCodePoint 0x00a0
  text        = "Super-cali#{keep_hyphen}frag#{shy}i#{shy}lis#{shy}tic\nis a won#{shy}der#{shy}ful word我很喜歡這個單字。"
  breaker = new LineBreaker text
  last = 0
  ### LBO: line break opportunity ###
  while ( lbo = breaker.nextBreak() )?
    # get the string between the last break and this one
    word  = text.slice last, lbo.position
    xhy   = if isa.interplot_shy word then ( CND.gold '-' ) else ''
    rq    = if lbo.required then '!' else ' '
    word  = word.trimEnd()
    info rq, ( jr word ), xhy
    last = lbo.position
  return null


############################################################################################################
if module is require.main then do =>
  # @demo_linebreak()
  @demo_hyphenation()


