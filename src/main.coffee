



'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'INTERPLOT/MAIN'
debug                     = CND.get_logger 'debug',     badge
alert                     = CND.get_logger 'alert',     badge
whisper                   = CND.get_logger 'whisper',   badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
info                      = CND.get_logger 'info',      badge
PATH                      = require 'path'
FS                        = require 'fs'
TEMPLATES                 = require './templates'
{ jr, }                   = CND
assign                    = Object.assign
#...........................................................................................................
page_html_path            = PATH.resolve PATH.join __dirname, '../public/main.html'
# S                         = require './settings'




#-----------------------------------------------------------------------------------------------------------
@write_page_source = ->
  ### Write out the HTML of the main page; this is strictly only needed when template has changed, which we
  maybe should detect in the future: ###
  page_source = TEMPLATES.main_2()
  # page_source = TEMPLATES.minimal()
  FS.writeFileSync page_html_path, page_source
  help "updated page source written to #{rpr PATH.relative process.cwd(), page_html_path}"



@write_page_source()


