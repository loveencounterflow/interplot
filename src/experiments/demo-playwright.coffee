


'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'INTERPLOT/DEMO-PLAYWRIGHT'
debug                     = CND.get_logger 'debug',     badge
alert                     = CND.get_logger 'alert',     badge
whisper                   = CND.get_logger 'whisper',   badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
info                      = CND.get_logger 'info',      badge
echo                      = CND.echo.bind CND
PATH                      = require 'path'
FS                        = require 'fs'
{ jr, }                   = CND
assign                    = Object.assign
join_path                 = ( P... ) -> PATH.resolve PATH.join P...
#...........................................................................................................
types                     = require '../types'
{ isa
  validate
  cast
  type_of }               = types
DIRECTOR                  = require 'playwright' # { chromium, firefox, webkit, }

###

* `director`: 'puppeteer' or 'playwright'
* `driver_name`: equivalent to Puppeteer's 'product', i.e. browser make:
  * for Puppeteer: `'chrome'` or `'firefox'`
  * for Playwright: `chromium`, `firefox` or `webkit`
* `context`:
  * [optional in
    Puppeteer](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#class-browsercontext),
  * [mandatory in
    Playwright](https://github.com/microsoft/playwright/blob/v0.10.0/docs/api.md#class-browsercontext)

in Puppeteer:   `director > product               > browser           > page`
in Playwright:  `director > driver_name > driver  > browser > context > page`

###


if module is require.main then do =>
  driver_name = 'firefox'
  # driver_name = 'webkit'
  # driver_name = 'chromium'
  driver      = DIRECTOR[ driver_name ]
  help '^907^', "launching #{driver_name}"
  # settings    = { headless: false, }
  settings    = ( require '../settings' ).puppeteer
  debug '^768^', "GUI:", not settings.headless
  browser     = await driver.launch settings
  context     = await browser.newContext()
  page        = await context.newPage 'https://en.wikipedia.org'
  # page        = await browser.newPage 'https://en.wikipedia.org'
  # await browser.close()




