
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'INTERPLOT/LINEMAKER'
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
DATOM                     = require 'datom'
{ new_datom
  select }                = DATOM.export()
HYPHENATOR                = require './hyphenator'
hyphenate                 = HYPHENATOR.new_hyphenator()

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
    htext = hyphenate text
    htext = htext.replace /\u00ad/g, '-'
    info htext
  return null


###

'Slab': the part of a word that is separated from others by breakpoints

> The addressable unit of memory on the NCR 315 series is a "slab", short for "syllable", consisting of 12
> data bits and a parity bit. Its size falls between a byte and a typical word (hence the name, 'syllable').
> A slab may contain three digits (with at sign, comma, space, ampersand, point, and minus treated as
> digits) or two alphabetic characters of six bits each.—[Wikipedia, "NCR
> 315"](https://en.wikipedia.org/wiki/NCR_315)

###

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
reconstitute_text = ( slab ) ->
  R = slab.txt
  if slab.rhs is 'shy' then R += '-'
  else if slab.rhs is 'spc' then R += ' '
  return R
@slabs_from_paragraph = ( text ) ->
  ### TAINT avoid to instantiate new parser for each paragraph ###
  ### TAINT consider to use pipestreaming instead of looping ###
  parse_html  = SP.HTML.new_onepiece_parser()
  ctx_stack   = []
  R           = []
  for d in parse_html text
    ### TAINT should check for matching tags ###
    ### TAINT must also store HTML attributes ###
    if ( select d, '<' )      then ctx_stack.push d.$key[ 1 .. ]
    else if ( select d, '>' ) then ctx_stack.pop()
    #.......................................................................................................
    if ( select d, '<' ) and ( d.is_block ? false )
      info CND.white '————————————————————————————————————— ' + d.$key
      continue
    #.......................................................................................................
    if ( select d, '^text' )
      text      = d.text.replace /\n/g, ' '
      slabs     = @slabs_from_text text
      R.push slabs
      # for slab in slabs.$value
      #   rhs = if slab.rhs? then slab.rhs else null
      opener  = "<slug>" + ( "<#{element}>" for element in ctx_stack ).join ''
      closer  = "</slug>"
      info ( CND.yellow opener ), \
        ( ( ( CND.blue reconstitute_text slab ) for slab in slabs.$value ). join CND.grey '|' ), \
        ( CND.yellow closer )
      continue
    whisper d.$key
  #.........................................................................................................
  return new_datom '^slab-blocks', R

#-----------------------------------------------------------------------------------------------------------
@slabs_from_text = ( text ) ->
  text          = hyphenate text
  ### TAINT benchmark against https://github.com/hfour/linebreak-ts ###
  LineBreaker   = require 'linebreak'
  breaker       = new LineBreaker text
  prv_position  = 0
  slabs         = []
  ### LBO: line break opportunity ###
  while ( lbo = breaker.nextBreak() )?
    txt           = text[ prv_position ... lbo.position ]
    prv_position  = lbo.position
    last_codeunit = txt[ txt.length - 1 ]
    slab          = {}
    if last_codeunit is HYPHENATOR.soft_hyphen_chr
      slab.rhs      = 'shy'
      txt           = txt[ ... txt.length - 1 ]
    else if last_codeunit is '\u0020'
      ### TAINT in the future, we might want to consider other breaking (fixed or variable) spaces ###
      slab.rhs      = 'spc'
      txt           = txt[ ... txt.length - 1 ]
    # debug '^876^', jr txt
    slab.txt = txt
    slabs.push slab
  return new_datom '^slabs', slabs

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
  # @demo_hyphenation()
  html = """<p><strong>Letterpress</strong> printing is a <em>technique of relief printing using a printing
  press,</em> a process by which many copies are produced by <em>repeated direct impression of an inked,
  raised surface</em> against sheets or a continuous roll of paper.</p> <p>A worker composes and locks
  movable type into the ‘bed’ or ‘chase’ of a press, inks it, and presses paper against it to transfer the
  ink from the type which creates an impression on the paper.</p>"""
  text = """Letterpress printing is a technique of relief printing using a printing press."""
  html = """<p>#{text}</p>"""
  # urge @slabs_from_paragraph html
  urge @slabs_from_text text


