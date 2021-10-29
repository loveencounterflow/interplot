



############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'PIPESTREAMS/TESTS/TEE'
log                       = CND.get_logger 'plain',     badge
info                      = CND.get_logger 'info',      badge
whisper                   = CND.get_logger 'whisper',   badge
alert                     = CND.get_logger 'alert',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
echo                      = CND.echo.bind CND
#...........................................................................................................
_format                   = require 'number-format.js'
format_float              = ( x ) -> _format '#,##0.000', x
format_integer            = ( x ) -> _format '#,##0.',    x
format_as_percentage      = ( x ) -> _format '#,##0.00',  x * 100
#...........................................................................................................
types                     = require '../types'
{ isa
  validate
  declare
  size_of
  type_of }               = types

# debug format_float 123.456789
# debug format_float 0.456789
# debug format_float 123456789.456789
# process.exit 1

#-----------------------------------------------------------------------------------------------------------
show_ranges = ( ranges ) ->
  count = 0
  for range in ranges
    count += range[ 1 ] - range[ 0 ] + 1
  help "found #{format_integer count} glyphs for #{rpr pattern}"
  for range in ranges
    [ first_cid, last_cid, ]  = range
    last_cid                 ?= first_cid
    glyphs                    = []
    for cid in [ first_cid .. ( Math.min first_cid + 10, last_cid ) ]
      glyphs.push String.fromCodePoint cid
    glyphs = glyphs.join ''
    first_cid_hex = "0x#{first_cid.toString 16}"
    last_cid_hex  = "0x#{last_cid.toString 16}"
    count_txt     = format_integer last_cid - first_cid + 1
    help "#{first_cid_hex} .. #{last_cid_hex} #{glyphs} (#{count_txt})"

#-----------------------------------------------------------------------------------------------------------
cid_matches_pattern = ( pattern, cid ) ->
  R = String.fromCodePoint cid
  return R if pattern.test R
  return null

#-----------------------------------------------------------------------------------------------------------
ranges_from_pattern = ( pattern ) ->
  ### TAINT doesn't work for negated expressions like /^[^\p{White_Space}]$/u ###
  R           = []
  range       = null
  first_cid   = 0x0000
  # last_cid    = 0x2ebe0
  last_cid    = 0x10ffff
  cid         = first_cid - 1
  prv_matched = false
  #.........................................................................................................
  while cid < last_cid
    cid += +1
    #.......................................................................................................
    if ( cid_matches_pattern pattern, cid )?
      unless prv_matched
        range = [ cid, ]
        R.push range
      prv_matched = true
    #.......................................................................................................
    else
      if prv_matched
        range.push cid - 1
        range = null
      prv_matched = false
  #.........................................................................................................
  return R

#-----------------------------------------------------------------------------------------------------------
patterns =
  control:                /^\p{Cc}$/u # Control
  format:                 /^\p{Cf}$/u # Format
  unassigned:             /^\p{Cn}$/u # Unassigned
  assigned:               /^\P{Cn}$/u # Assigned
  pua:                    /^\p{Co}$/u # Private Use
  surrogate:              /^\p{Cs}$/u # Surrogate
  ideographic:            /^\p{Ideographic}$/u
  ids_binary_operator:    /^\p{IDS_Binary_Operator}$/u
  ids_trinary_operator:   /^\p{IDS_Trinary_Operator}$/u
  radical:                /^\p{Radical}$/u
  han:                    /^\p{Script=Han}$/u
  hiragana:               /^\p{Script=Hiragana}$/u
  katakana:               /^\p{Script=Katakana}$/u
  latin:                  /^\p{Script=Latin}$/u
  cyrillic_plus:          /^\p{Script_Extensions=Cyrillic}$/u
  greek_plus:             /^\p{Script_Extensions=Greek}$/u
  hangul_plus:            /^\p{Script_Extensions=Hangul}$/u
  han_plus:               /^\p{Script_Extensions=Han}$/u
  hiragana_plus:          /^\p{Script_Extensions=Hiragana}$/u
  katakana_plus:          /^\p{Script_Extensions=Katakana}$/u
  latin_plus:             /^\p{Script_Extensions=Latin}$/u
  unified_ideograph:      /^\p{Unified_Ideograph}$/u
  whitespace:             /^\p{White_Space}$/u

#-----------------------------------------------------------------------------------------------------------
# pattern_A   = /^\p{Script=Latin}$/u
# pattern_B   = /^\p{Script_Extensions=Latin}$/u
### see https://github.com/mathiasbynens/regexpu-core/blob/master/property-escapes.md ###
patterns    = []
# patterns.push /^\p{Script_Extensions=Latin}$/u
patterns.push /^\p{Script_Extensions=Arabic}$/u
# patterns.push /^\p{Script=Latin}$/u
# # patterns.push /^\p{Script_Extensions=Cyrillic}$/u
# # patterns.push /^\p{Script_Extensions=Greek}$/u
# patterns.push /^\p{Unified_Ideograph}$/u
# patterns.push /^\p{Script=Han}$/u
patterns.push /^\p{Script_Extensions=Han}$/u
patterns.push /^\p{IDS_Binary_Operator}$/u
patterns.push /^\p{IDS_Trinary_Operator}$/u
# patterns.push /^\p{Radical}$/u
# patterns.push /^\p{White_Space}$/u
# patterns.push /^\p{Script_Extensions=Hiragana}$/u
patterns.push /^\p{Script=Hiragana}$/u
# patterns.push /^\p{Script_Extensions=Katakana}$/u
patterns.push /^\p{Script=Katakana}$/u
patterns.push /^\p{Script_Extensions=Hangul}$/u
patterns.push /^\p{Ideographic}$/u
for pattern in patterns
  show_ranges ranges_from_pattern pattern

info isa.interplot_text_with_hiragana 'あいうえおか'
info isa.interplot_text_with_hiragana 'あいうえおかx'
info isa.interplot_text_with_hiragana 'abc'
info isa.interplot_text_hiragana      'あいうえおか'
info isa.interplot_text_with_ideographic      'あいうえおか'
info isa.interplot_text_cjk           'あいうえおか〇〡〢〣〤〥〦〧〨〩〸〹〺㐀㐁㐂一丁丂豈更車並况全𗀀𗀁𗀂𘠄𘠅𘠆𘠇𘠈𘠉𘠊𛅰𛅱𛅲𛅳𠀀𠀁가각갂、。〃《》【】〓〜ｦｧｨｩｱｲｳｴ⿰⿱𝍦𝍧𝍨'
info isa.interplot_text_with_cjk      'あいうえおか〇〡〢〣〤〥〦〧〨〩〸〹〺㐀㐁㐂一丁丂豈更車並况全𗀀𗀁𗀂𘠄𘠅𘠆𘠇𘠈𘠉𘠊𛅰𛅱𛅲𛅳𠀀𠀁가각갂、。〃《》【】〓〜ｦｧｨｩｱｲｳｴ⿰⿱𝍦𝍧𝍨'
info isa.interplot_text_cjk           'abcあいうえおか〇〡〢〣〤〥〦〧〨〩〸〹〺㐀㐁㐂一丁丂豈更車並况全𗀀𗀁𗀂𘠄𘠅𘠆𘠇𘠈𘠉𘠊𛅰𛅱𛅲𛅳𠀀𠀁가각갂、。〃《》【】〓〜ｦｧｨｩｱｲｳｴ⿰⿱𝍦𝍧𝍨'
info isa.interplot_text_with_cjk      'abcあいうえおか〇〡〢〣〤〥〦〧〨〩〸〹〺㐀㐁㐂一丁丂豈更車並况全𗀀𗀁𗀂𘠄𘠅𘠆𘠇𘠈𘠉𘠊𛅰𛅱𛅲𛅳𠀀𠀁가각갂、。〃《》【】〓〜ｦｧｨｩｱｲｳｴ⿰⿱𝍦𝍧𝍨'
info ///^#{types._regex_any_of_cjk_property_terms()}+$///



