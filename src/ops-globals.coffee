
#-----------------------------------------------------------------------------------------------------------
globalThis.after             	= ( dts, f ) -> setTimeout f, dts * 1000
globalThis.log               	= console.log
globalThis.running_in_browser	= -> @window?
globalThis.jr 								= JSON.stringify
globalThis.get_approximate_ratio = ( length, gauge, precision = 100 ) ->
  return ( Math.floor ( length / gauge ) * precision + 0.5 ) / precision

