
#-----------------------------------------------------------------------------------------------------------
globalThis.after                  = ( dts, f ) -> setTimeout f, dts * 1000
globalThis.log                    = console.log
globalThis.warn                   = console.warn
globalThis.running_in_browser     = -> @window?
globalThis.jr                     = JSON.stringify
globalThis.sleep                  = ( dts ) -> new Promise ( done ) => setTimeout done, dts * 1000
globalThis.as_plain_object        = ( x ) -> JSON.parse JSON.stringify x

#-----------------------------------------------------------------------------------------------------------
globalThis.js_type_of = ( x ) ->
  return ( ( Object::toString.call x ).slice 8, -1 ).toLowerCase().replace /\s+/g, ''

#-----------------------------------------------------------------------------------------------------------
globalThis.get_approximate_ratio = ( length, gauge, precision = 100 ) ->
  return ( Math.floor ( length / gauge ) * precision + 0.5 ) / precision

#-----------------------------------------------------------------------------------------------------------
globalThis._KW_as_dom_node = ( dom_or_jquery ) ->
  return dom_or_jquery[ 0 ] if ( typeof dom_or_jquery?.jquery ) is 'string'
  return dom_or_jquery

#-----------------------------------------------------------------------------------------------------------
### TAINT intermediate solution until intertext can be browserified ###
globalThis.INTERTEXT ?= {}
#-----------------------------------------------------------------------------------------------------------
INTERTEXT.camelize = ( text ) ->
  ### thx to https://github.com/lodash/lodash/blob/master/camelCase.js ###
  words = text.split '-'
  for idx in [ 1 ... words.length ] by +1
    word = words[ idx ]
    continue if word is ''
    words[ idx ] = word[ 0 ].toUpperCase() + word[ 1 .. ]
  return words.join ''




