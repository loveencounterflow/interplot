
#-----------------------------------------------------------------------------------------------------------
globalThis.after             	= ( dts, f ) -> setTimeout f, dts * 1000
globalThis.log               	= console.log
globalThis.running_in_browser	= -> @window?
globalThis.jr 								= JSON.stringify

