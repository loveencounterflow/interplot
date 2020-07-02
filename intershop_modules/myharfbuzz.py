#!/usr/bin/python
# -*- coding: utf-8 -*-

# import sys
# import getpass
# import os
# import json       as _JSON
import uharfbuzz  as HB


#-----------------------------------------------------------------------------------------------------------
def demo_uharfbuzz( ctx, text ):
  # font_path   = '/home/flow/io/mingkwai-rack/jizura-fonts/fonts/ipamp.ttf'
  # font_path   = '/home/flow/io/mingkwai-rack/jizura-fonts/fonts/EBGaramondSC12-Regular.otf'
  # font_path   = '/home/flow/io/mingkwai-rack/jizura-fonts/fonts/HanaMinA.ttf'
  # font_path   = '/home/flow/io/mingkwai-rack/jizura-fonts/fonts/lmroman10-italic.otf'
  font_path   = '/home/flow/io/mingkwai-rack/jizura-fonts/fonts/sunflower-exta-201903.ttf' ### use this edition of Sun-ExtA ###
  # font_path   = '/home/flow/jzr/benchmarks/assets/fontmirror/fmcatalog/all/sunːextaːttf'
  # font_path   = '/home/flow/io/mingkwai-rack/jizura-fonts/fonts/sun-exta.ttf'
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
    ctx.log( metrics )
  return R




