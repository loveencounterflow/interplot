
#-----------------------------------------------------------------------------------------------------------
globalThis.after                  = ( dts, f ) -> setTimeout f, dts * 1000
globalThis.log                    = console.log
globalThis.warn                   = console.warn
globalThis.running_in_browser     = -> @window?
globalThis.jr                     = JSON.stringify
globalThis.as_plain_object        = ( x ) -> JSON.parse JSON.stringify x

#-----------------------------------------------------------------------------------------------------------
globalThis.js_type_of = ( x ) ->
  return ( ( Object::toString.call x ).slice 8, -1 ).toLowerCase().replace /\s+/g, ''

#-----------------------------------------------------------------------------------------------------------
globalThis.get_approximate_ratio = ( length, gauge, precision = 100 ) ->
  return ( Math.floor ( length / gauge ) * precision + 0.5 ) / precision

