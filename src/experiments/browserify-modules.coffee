
'use strict'

globalThis.µ ?= {}
µ.TYPES = new ( require 'intertype' ).Intertype()

µ.TYPES.declare 'frob', ( x ) -> ( @isa.text x ) or x is 42
µ.TYPES.declare 'domelement', ( x ) ->
	( @type_of x ) in [ 'htmlhtmlelement', 'htmldocument', 'htmlunknownelement', ]

µ.rpr 	= require 'util-inspect'
µ.TMP	 ?= {}
µ.TMP._css_properties = require './css-properties.js'
µ.TMP._css_font_properties = ( k for k, v of µ.TMP._css_properties when v.fonts ).sort()

# INTERTEXT 								= require 'intertext'
# { HYPH, }									= INTERTEXT
# console.log '^4453-2^', INTERTEXT
# console.log '^4453-3^', HYPH
# console.log '^4453-4^', HYPH.reveal_hyphens HYPH.hyphenate "welcome to the world of InterText hyphenation!"

# browserify lib/experiments/browserify-modules.js --ignore-missing -o public/browserified.js


