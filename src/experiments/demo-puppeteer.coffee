



'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'INTERPLOT/DEMO-PUPPETEER'
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
after                     = ( dts, f ) -> setTimeout f, dts * 1000
page_html_path            = PATH.resolve PATH.join __dirname, '../../public/main.html'
PUPPETEER                 = require 'puppeteer'

#-----------------------------------------------------------------------------------------------------------
demo_1 = ->
  urge "µ29922-1 launching browser"
  browser = await PUPPETEER.launch()
  urge "µ29922-2 new page"
  page    = await browser.newPage()
  urge "µ29922-3 page goto"
  await page.goto 'https://de.wikipedia.org/wiki/Berlin', { waitUntil: 'networkidle2', }
  urge "µ29922-4 take PDF"
  await page.pdf  { path: 'page.pdf', format: 'A4', }
  urge "µ29922-5 close"
  await browser.close()
  urge "µ29922-6 done"

#-----------------------------------------------------------------------------------------------------------
settings =
  puppeteer:
    headless:           false
    deviceScaleFactor:  2
    args: [
      '--disable-infobars' # hide 'Chrome is being controlled by ...'
      '--no-first-run'
      '--incognito'
      # process.env.NODE_ENV === "production" ? "--kiosk" : null
      '--allow-file-access-from-files'
      '--no-sandbox'
      '--disable-setuid-sandbox'
      ]

# #-----------------------------------------------------------------------------------------------------------
# getImageContent = ( page, url ) =>
#   frameId = String page.mainFrame()._id
#   debug 'µ37744', 'frameId', rpr frameId
#   debug 'µ37744', 'url', rpr url
#   { content, base64Encoded } = await page._client.send 'Page.getResourceContent', { frameId, url }
#   unless base64Encoded
#     throw new Error "µ34774", 'expected base64Encoded'
#   return content

#-----------------------------------------------------------------------------------------------------------
demo_2 = ->
  # Set up browser and page.
  urge "µ29923-1 launching browser"
  browser = await PUPPETEER.launch settings.puppeteer
  urge "µ29923-2 new page"
  page    = await browser.newPage()
  page.setViewport { width: 1280, height: 926, }
  page.on 'error', ( error ) => throw error
  page.on 'console', ( c ) =>
    if c._type is 'error'
      warn 'µ37763', 'console:', c._text
      process.exit 1
      # throw new Error c._text
    else
      info 'µ37763', 'console:', c._text
  # Navigate to this blog post and wait a bit.
  urge "µ29923-3-1 page goto"
  # await page.goto 'https://intoli.com/blog/saving-images/'
  await page.goto 'file:///home/flow/io/interplot/public/main.html'
  urge "µ29923-4-2 page goto"
  await page.waitForSelector '#my_dataviz'
  urge "µ29923-5-3 page goto"
  # Select the #my_dataviz img element and save the screenshot.
  svg_image = await page.$ '#my_dataviz'
  urge "µ29923-6 take screenshot"
  await svg_image.screenshot { path: 'logo-screenshot.png', omitBackground: false, }
  # #.........................................................................................................
  # try
  #   urge "µ29923-7 get SVG"
  #   url           = await page.evaluate => ( document.querySelector '#my_dataviz' ).src
  #   content       = await getImageContent page, url
  #   contentBuffer = Buffer.from content, 'base64'
  #   fs.writeFileSync 'logo-extracted.svg', contentBuffer, 'base64'
  # catch error
  #   warn error
  #.........................................................................................................
  saveSvgAsPng ( document.getElementById '#my_dataviz' ), 'diagram.png'
  #.........................................................................................................
  urge "µ29923-8 close"
  # after 0, => await browser.close()
  urge "µ29923-9 done"



############################################################################################################
unless module.parent?
  do =>
    await demo_2()
    help 'ok'



