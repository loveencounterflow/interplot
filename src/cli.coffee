
'use strict'

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'INTERPLOT/CLI'
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
FS                        = require 'fs'
PATH                      = require 'path'
{ assign
  jr }                    = CND
# { walk_cids_in_cid_range
#   cwd_abspath
#   cwd_relpath
#   here_abspath
#   _drop_extension
#   project_abspath }       = require './helpers'
types                     = require './types'
{ isa
  validate
  cast
  defaults
  type_of }               = types
#...........................................................................................................
# require                   './exception-handler'

#-----------------------------------------------------------------------------------------------------------
@cli = -> new Promise ( done ) =>
  TEMPLATES   = require './templates'
  app         = require 'commander'
  has_command = false
  #.........................................................................................................
  app
    .name     'InterPlot'
    .version  ( require '../package.json' ).version
  # #.........................................................................................................
  # app
  #   .name     FONTMIRROR.CFG.name
  #   .version  FONTMIRROR.CFG.version
  # #.........................................................................................................
  # app
  #   .command 'cfg'
  #   .description "show current configuration values"
  #   .action ( source_path, d ) =>
  #     has_command = true
  #     FONTMIRROR.CFG.show_cfg()
  #     done()
  #.........................................................................................................
  app
    .command 'write-template <template_name> <target_path> [parameters...]'
    .description "Write a template to HTML"
    .action ( template_name, target_path, parameters, d ) =>
      has_command = true
      unless isa.interplot_template_name template_name
        warn "not a valid template name: #{rpr template_name}"
        help "valid template names include"
        help ( rpr name for name of TEMPLATES ).join ', '
        process.exit 1
      html = TEMPLATES[ template_name ] parameters...
      if target_path is '%'
        echo html
      else
        FS.writeFileSync target_path, html
        help "output written to #{target_path}"
      done()
  #.........................................................................................................
  app.parse process.argv
  unless has_command
    app.outputHelp ( message ) -> ( CND.orange message ) + CND.blue """

      use % (percent sign) to write to stdout, may add parameters after that, ex.:
      node lib/cli.js write-template layout % foobar\n"""
  # debug '^33376^', ( k for k of app).sort().join ', '
  return null


############################################################################################################
if module is require.main then do =>
  await @cli()


