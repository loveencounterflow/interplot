#!/usr/bin/python
# -*- coding: utf-8 -*-

# import sys
# import getpass
# import os
# import json       as _JSON
import uharfbuzz  as HB

#-----------------------------------------------------------------------------------------------------------
def _get_cache( ctx ):
  R = ctx.get( 'harfbuzz', None )
  if R != None: return R
  R       = ctx.harfbuzz = ctx.AttributeDict()
  R.fonts = ctx.AttributeDict()
  return R

#-----------------------------------------------------------------------------------------------------------
def get_mhbfont( ctx, path ):
  cache = _get_cache( ctx )
  R     = cache.fonts.get( path, None )
  if R != None:
    ctx.log( '^myharfbuzz/get_mhbfont@334^', "font cached: {}".format( path ) )
    return R
  #.........................................................................................................
  ctx.log( '^myharfbuzz/get_mhbfont@335^', "reading font: {}".format( path ) )
  with open( path, 'rb' ) as fontfile: fontdata = fontfile.read()
  R             = ctx.AttributeDict()
  R.face        = HB.Face( fontdata )
  R.font        = HB.Font( R.face   )
  R.upem        = R.face.upem
  R.font.scale  = ( R.upem, R.upem, )
  HB.ot_font_set_funcs( R.font )
  #.........................................................................................................
  cache.fonts[ path ] = R
  return R


#-----------------------------------------------------------------------------------------------------------
def get_detailed_metrics( ctx, text ):
  # font_path   = '/home/flow/jzr/hengist/assets/jizura-fonts/ipamp.ttf'
  # font_path   = '/home/flow/jzr/hengist/assets/jizura-fonts/EBGaramondSC12-Regular.otf'
  font_path   = '/home/flow/jzr/hengist/assets/jizura-fonts/HanaMinA.otf'
  # font_path   = '/home/flow/jzr/hengist/assets/jizura-fonts/HanaMinA.ttf'
  # font_path   = '/home/flow/jzr/hengist/assets/jizura-fonts/lmroman10-italic.otf'
  # font_path   = '/home/flow/jzr/hengist/assets/jizura-fonts/sunflower-exta-201903.ttf' ### use this edition of Sun-ExtA ###
  # font_path   = '/home/flow/jzr/benchmarks/assets/fontmirror/fmcatalog/all/sunːextaːttf'
  # font_path   = '/home/flow/jzr/hengist/assets/jizura-fonts/sun-exta.ttf'
  # font_path   = '/home/flow/jzr/hengist/assets/jizura-fonts/FandolKai-Regular.otf'
  with open( font_path, 'rb' ) as fontfile:
    fontdata = fontfile.read()
  # text        = "_ffi__f_i_ff_fi"
  # text        = "这个活动"
  face        = HB.Face( fontdata )
  font        = HB.Font( face     )
  upem        = face.upem
  font.scale  = ( upem, upem, )
  HB.ot_font_set_funcs(font)
  buf         = HB.Buffer()
  buf.add_str( text )
  buf.guess_segment_properties()
  features    = { 'kern': True, 'liga': True, }
  HB.shape( font, buf, features )
  infos       = buf.glyph_infos
  positions   = buf.glyph_positions
  R           = []
  # ctx.log( '^77736^', "info:", dir( infos[ 0 ] ) ) # 'cluster', 'codepoint'
  # ctx.log( '^77736^', "position:", dir( positions[ 0 ] ) ) # 'position', 'x_advance', 'x_offset', 'y_advance', 'y_offset'
  for info, position in zip( infos, positions ):
    metrics = {
      'upem':       upem,
      'gid':        info.codepoint,
      'cluster':    info.cluster,
      'x_advance':  position.x_advance / upem, }
      # 'x_advance':  position.x_advance, }
      # 'y_advance':  position.y_advance,
      # 'x_offset':   position.x_offset,
      # 'y_offset':   position.y_offset, }
    R.append( metrics )
    # ctx.log( metrics )
  return R

#-----------------------------------------------------------------------------------------------------------
def metrics_from_text( ctx, font_path, text ):
  mhbfont       = get_mhbfont( ctx, font_path )
  bfr           = HB.Buffer()
  bfr.add_str( text )
  bfr.guess_segment_properties()
  features      = { 'kern': True, 'liga': True, }
  HB.shape( mhbfont.font, bfr, features )
  infos         = bfr.glyph_infos
  positions     = bfr.glyph_positions
  scale         = 1000 / mhbfont.upem
  R             = ctx.AttributeDict()
  width         = 0
  R.width       = width
  R.parts       = []
  for info, position in zip( infos, positions ):
    part                  = ctx.AttributeDict()
    x_advance             = position.x_advance  * scale
    part.dx               = round( x_advance )
    width                += x_advance
    # part.x_offset        = position.x_offset   * scale
    # part.y_advance       = position.y_advance  * scale
    # part.y_offset        = position.y_offset   * scale
    part.gid             = info.codepoint
    R.parts.append( part )
  # ctx.log( '^77767^', part )
  R.width = round( width )
  return R

# #-----------------------------------------------------------------------------------------------------------
# def metrics_from_text( ctx, font_path, text, size = 1 ):
#   mhbfont       = get_mhbfont( ctx, font_path )
#   bfr           = HB.Buffer()
#   bfr.add_str( text )
#   bfr.guess_segment_properties()
#   features      = { 'kern': True, 'liga': True, }
#   HB.shape( mhbfont.font, bfr, features )
#   infos         = bfr.glyph_infos
#   positions     = bfr.glyph_positions
#   scale         = size / mhbfont.upem
#   R             = {}
#   R[ 'width' ]  = 0
#   R[ 'parts' ]  = parts = []
#   for info, position in zip( infos, positions ):
#     part                  = {}
#     part[ 'x_advance' ]   = position.x_advance  * scale
#     R[ 'width' ]         += part[ 'x_advance' ]
#     part[ 'gid' ]         = info.codepoint
#     parts.append( part )
#   ctx.log( '^2234^', repr( R ) )
#   return R

  # ctx.log( '^2234^', repr( R ) )
    # for key in dir( position ):
    #   if key.startswith( '_' ): continue
    #   ctx.log( '^22337^', key, repr( getattr( position, key ) ) )

# import uharfbuzz  as HB
# HB.Buffer                                 # type
# HB.BufferClusterLevel                     # enum.EnumMeta
# HB.Callable                               # typing.CallableMeta
# HB.Dict                                   # typing.GenericMeta
# HB.Face                                   # type
# HB.Font                                   # type
# HB.FontFuncs                              # type
# HB.GlyphInfo                              # type
# HB.GlyphPosition                          # type
# HB.IntEnum                                # enum.EnumMeta
# HB.List                                   # typing.GenericMeta
# HB.Tuple                                  # typing.TupleMeta
# HB.ot_font_set_funcs()                    # builtin_function_or_method
# HB.ot_layout_get_baseline()               # builtin_function_or_method
# HB.ot_layout_language_get_feature_tags()  # builtin_function_or_method
# HB.ot_layout_script_get_language_tags()   # builtin_function_or_method
# HB.ot_layout_table_get_script_tags()      # builtin_function_or_method
# HB.shape()                                # builtin_function_or_method
# HB.version_string()                       # builtin_function_or_method

# face = HB.Face( fontdata )
# face.create()
# face.create_for_tables()
# face.upem()

# font = HB.Font( face )
# font.create()             # builtin_function_or_method
# font.face                 # uharfbuzz._harfbuzz.Face
# font.funcs                # NoneType
# font.get_glyph_name()     # builtin_function_or_method
# font.glyph_to_string()    # builtin_function_or_method
# font.scale                # tuple
# font.set_variations()     # builtin_function_or_method

# buffer = HB.Buffer()
# buffer.add_codepoints()
# buffer.add_str()
# buffer.add_utf8()
# buffer.cluster_level()
# buffer.create()
# buffer.direction()
# buffer.glyph_infos()
# buffer.glyph_positions()
# buffer.guess_segment_properties()
# buffer.language()
# buffer.script()
# buffer.set_language_from_ot_tag()
# buffer.set_message_func()
# buffer.set_script_from_ot_tag()

# glyph_info.cluster <class 'int'>
# glyph_info.codepoint <class 'int'>


