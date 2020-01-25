
#-----------------------------------------------------------------------------------------------------------
globalThis.after                  = ( dts, f ) -> setTimeout f, dts * 1000
globalThis.log                    = console.log
globalThis.warn                   = console.warn
globalThis.running_in_browser     = -> @window?
globalThis.jr                     = JSON.stringify
globalThis.sleep                  = ( dts ) -> new Promise ( done ) => setTimeout done, dts * 1000
globalThis.as_plain_object        = ( x ) -> JSON.parse JSON.stringify x
globalThis.as_html                = ( dom_or_jquery ) -> ( as_dom_node dom_or_jquery ).outerHTML

#-----------------------------------------------------------------------------------------------------------
globalThis.js_type_of = ( x ) ->
  return ( ( Object::toString.call x ).slice 8, -1 ).toLowerCase().replace /\s+/g, ''

#-----------------------------------------------------------------------------------------------------------
globalThis.get_approximate_ratio = ( length, gauge, precision = 100 ) ->
  return ( Math.floor ( length / gauge ) * precision + 0.5 ) / precision

#-----------------------------------------------------------------------------------------------------------
globalThis.as_dom_node = ( dom_or_jquery ) ->
  return dom_or_jquery[ 0 ] if ( typeof dom_or_jquery?.jquery ) is 'string'
  return dom_or_jquery

#-----------------------------------------------------------------------------------------------------------
globalThis.get_style = ( dom_or_jquery, pseudo_selector, attribute_name ) ->
  unless attribute_name?
    [ pseudo_selector, attribute_name, ] = [ undefined, pseudo_selector, ]
  style = window.getComputedStyle ( as_dom_node dom_or_jquery ), pseudo_selector
  ### TAINT why not `style[ attribute_name ]`? ###
  return style.getPropertyValue attribute_name



