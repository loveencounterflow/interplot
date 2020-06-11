
'use strict'

misfit                = Symbol 'misfit'
_types                = µ.TYPES.export()
V                     = _types.validate
{ isa }               = _types
name_of_match_method  = do ->
  element = document.createElement 'div'
  for name in [ 'matches', 'matchesSelector', 'msMatchesSelector', \
    'mozMatchesSelector', 'webkitMatchesSelector', 'oMatchesSelector', ]
    return name if element[ name ]?

#===========================================================================================================
class Micro_dom # extends Multimix
  ### inspired by http://youmightnotneedjquery.com/ ###

  #-----------------------------------------------------------------------------------------------------------
  ready: ( f ) ->
    # thx to https://stackoverflow.com/a/7053197/7568091
    # function r(f){/in/.test(document.readyState)?setTimeout(r,9,f):f()}
    V.function f
    return ( setTimeout ( => @ready f ), 9 ) if /in/.test document.readyState
    return f()

  #-----------------------------------------------------------------------------------------------------------
  select:     ( selector, fallback = misfit ) -> @select_from     document, selector, fallback
  select_all: ( selector                    ) -> @select_all_from document, selector

  #-----------------------------------------------------------------------------------------------------------
  select_from: ( element, selector, fallback = misfit ) ->
    V.nonempty_text selector
    V.domelement element
    R = element.querySelector selector
    if not R?
      throw new Error "^µDOM/select@7758^ no such element: #{µ.rpr selector}" if fallback is misfit
      return fallback
    return R

  #-----------------------------------------------------------------------------------------------------------
  select_all_from: ( element, selector ) ->
    V.nonempty_text selector
    V.domelement element
    Array.from element.querySelectorAll selector

  #-----------------------------------------------------------------------------------------------------------
  select_id:  ( id ) ->
    V.nonempty_text id
    return document.getElementById id

  #-----------------------------------------------------------------------------------------------------------
  matches_selector: ( element, selector ) ->
    V.nonempty_text selector
    V.domelement element
    return element[ name_of_match_method ] selector

  #-----------------------------------------------------------------------------------------------------------
  get:              ( element, name         ) -> V.domelement element; element.getAttribute name
  set:              ( element, name, value  ) -> V.domelement element; element.setAttribute name, value
  #-----------------------------------------------------------------------------------------------------------
  get_classes:      ( element               ) -> V.domelement element; element.classList
  add_class:        ( element, name         ) -> V.domelement element; element.classList.add      name
  has_class:        ( element, name         ) -> V.domelement element; element.classList.contains name
  remove_class:     ( element, name         ) -> V.domelement element; element.classList.remove   name
  toggle_class:     ( element, name         ) -> V.domelement element; element.classList.toggle   name
  #-----------------------------------------------------------------------------------------------------------
  hide:             ( element               ) -> V.domelement element; element.style.display = 'none'
  show:             ( element               ) -> V.domelement element; element.style.display = ''
  #-----------------------------------------------------------------------------------------------------------
  get_inner_html:   ( element               ) -> V.domelement element; element.innerHTML
  get_outer_html:   ( element               ) -> V.domelement element; element.outerHTML
  #-----------------------------------------------------------------------------------------------------------
  get_live_styles:  ( element               ) -> getComputedStyle element ### validation done by method ###
  get_style_rule:   ( element, name         ) -> ( getComputedStyle element )[ name ] ### validation done by method ###

  #-----------------------------------------------------------------------------------------------------------
  parse_html: ( html ) ->
    R = document.implementation.createHTMLDocument()
    R.body.innerHTML = html
    return R.body.children

  #-----------------------------------------------------------------------------------------------------------
  new_element: ( xname, P... ) ->
    ### TAINT analyze xname (a la `div#id42.foo.bar`) as done in Intertext.Cupofhtml ###
    R           = document.createElement xname
    attributes  = {}
    text        = null
    for p in P
      if isa.text p
        text = p
        continue
      attributes = Object.assign attributes, p ### TAINT check type? ###
    R.textContent = text if text?
    R.setAttribute k, v for k, v of attributes
    return R

( globalThis.µ ?= {} ).DOM = new Micro_dom()

