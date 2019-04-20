



'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = '明快打字机/APP'
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
#...........................................................................................................
PD                        = require 'pipedreams'
{ $
  async }                 = PD
#...........................................................................................................
page_html_path            = PATH.resolve PATH.join __dirname, '../../public/main.html'
PUPPETEER 								= require 'puppeteer'

#-----------------------------------------------------------------------------------------------------------
do ->
	browser	= await PUPPETEER.launch()
	page   	= await browser.newPage()
	await page.goto 'https://www.chromestatus.com', {waitUntil: 'networkidle2'}
	await page.pdf  { path: 'page.pdf', format: 'A4', }
	await browser.close()





