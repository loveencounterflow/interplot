#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys
import getpass
import os
import json as _JSON
# import pip

#-----------------------------------------------------------------------------------------------------------
def provide_uharfbuzz( ctx ):
  ### thx to https://stackoverflow.com/a/50395128/7568091 ###
  ### thx to https://stackoverflow.com/a/67692/7568091 ###
  import importlib.util
  name                      = 'uharfbuzz'
  path                      = ctx.get_variable( 'uharfbuzz/path' )
  spec                      = importlib.util.spec_from_file_location( name, path )
  module                    = importlib.util.module_from_spec( spec )
  sys.modules[ spec.name ]  = module
  spec.loader.exec_module( module )
  import uharfbuzz
  ctx.uharfbuzz             = uharfbuzz
  return uharfbuzz

#-----------------------------------------------------------------------------------------------------------
def f( ctx ):
   # ~/.local/lib/python3.6/site-packages/
  username = getpass.getuser()
  homedir = os.path.expanduser("~")
  ctx.log( '^3397745^', "__file__:", __file__ )
  ctx.log( '^3397745^', "os.path.basename( __file__ ):", os.path.basename( __file__ ) )
  ctx.log( '^3397745^', "os.path.dirname( __file__ ):", os.path.dirname( __file__ ) )
  ctx.log( '^3397745^', "os.path.expanduser( '~/.local' ):", os.path.expanduser( '~/.local' ) )
  ctx.log( '^3397745^', "username:", username )
  ctx.log( '^3397745^', "homedir:", homedir )
  ctx.log( '^3397745^', "sys.executable:", sys.executable )
  # ctx.log( '^3397745^', "ctx:", ctx )
  # for key, value in ctx:
  #   ctx.log( '^3397745^', { 'key': key, 'value': value, } )
  ctx.log( '^3397745^', "list( k for k in ctx ):", list( k for k in ctx ) )
  ctx.log( '^3397745^', "ctx.get_variable( 'intershop/host/bin/path'):", ctx.get_variable( 'intershop/host/bin/path') )
  # ctx.log( '^3397745^', "ctx.uharfbuzz_path:", ctx.uharfbuzz_path )
  # ctx.log( '^3397745^', "ctx.get_variable_names():", ctx.get_variable_names() )
  ctx.log( '^3397745^', "ctx.get_variable( 'uharfbuzz/path' ):", ctx.get_variable( 'uharfbuzz/path' ) )
  ctx.log( '\u4e01' + _JSON.dumps( { '$key': '^rpc', } ) )
  #.........................................................................................................
  ctx.log( '^22787^', "ctx.addons:", ctx.addons )
  # for path in sys.path:
  #   ctx.log( '^2221^', '-->', path )
  #.........................................................................................................
  # import uharfbuzz

#-----------------------------------------------------------------------------------------------------------
def demo_uharfbuzz( ctx, text ):
  HB = ctx.uharfbuzz
  # import uharfbuzz as HB
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




