(function() {
  /*

  Experimental categorization of CSS properties need to implement caching of slugs (pre-assembled bits of
  type). In order to avoid typesetting elements—words and partial words—over and over again just to obtain the
  same appearance and the same metrics all over again, it might be advantageous to cache known elements and be
  able to perform the costliest part of line-fitting—putting type on a browser page with a suitable
  environment to see how it fits— entirely offline, i.e. without needing the browser to do anything at all.

  This will only be possible for those case where one has already tried a given combination of a sequence of
  codepoints in the typographically same environment, that is, with the same font, the same size, the same
  font style (bold/italic) and so on. The task then is to identify such factors that may be used to
  'fingerprint' typographic settings such that a when a combination of a codepoint sequence (a word or a part
  thereof; any sequence that is surrounded by line break opportunities) and a 'typographic ID' occurs, we can
  be sure of the metrics of the typeset material, and re-use cached metrics instead of typesetting the
  material in the browser.

  Out of the hundreds of CSS property that may apply to a given point in a document, only a fraction will be
  relevant for the 'metric behavior' of type. As a preliminary measure, they have been identified in the below
  table under the property here named `fonts`. A value of `false` indicates the property is definitely
  unrelated to font appearance; a value of `null` (also falsey) indicates that the property might be of
  interest now or later on; a value of `true` indicates the property is definitely releavant for font metrics
  caching.

  */
  module.exports = {
    '-webkit-app-region': {
      fonts: false,
      sample: 'none'
    },
    '-webkit-appearance': {
      fonts: false,
      sample: 'none'
    },
    '-webkit-border-horizontal-spacing': {
      fonts: false,
      sample: '0px'
    },
    '-webkit-border-image': {
      fonts: false,
      sample: 'none'
    },
    '-webkit-border-vertical-spacing': {
      fonts: false,
      sample: '0px'
    },
    '-webkit-box-align': {
      fonts: false,
      sample: 'stretch'
    },
    '-webkit-box-decoration-break': {
      fonts: false,
      sample: 'slice'
    },
    '-webkit-box-direction': {
      fonts: false,
      sample: 'normal'
    },
    '-webkit-box-flex': {
      fonts: false,
      sample: '0'
    },
    '-webkit-box-ordinal-group': {
      fonts: false,
      sample: '1'
    },
    '-webkit-box-orient': {
      fonts: false,
      sample: 'horizontal'
    },
    '-webkit-box-pack': {
      fonts: false,
      sample: 'start'
    },
    '-webkit-box-reflect': {
      fonts: false,
      sample: 'none'
    },
    '-webkit-highlight': {
      fonts: false,
      sample: 'none'
    },
    '-webkit-mask-box-image': {
      fonts: false,
      sample: 'none'
    },
    '-webkit-mask-box-image-outset': {
      fonts: false,
      sample: '0'
    },
    '-webkit-mask-box-image-repeat': {
      fonts: false,
      sample: 'stretch'
    },
    '-webkit-mask-box-image-slice': {
      fonts: false,
      sample: '0 fill'
    },
    '-webkit-mask-box-image-source': {
      fonts: false,
      sample: 'none'
    },
    '-webkit-mask-box-image-width': {
      fonts: false,
      sample: 'auto'
    },
    '-webkit-mask-clip': {
      fonts: false,
      sample: 'border-box'
    },
    '-webkit-mask-composite': {
      fonts: false,
      sample: 'source-over'
    },
    '-webkit-mask-image': {
      fonts: false,
      sample: 'none'
    },
    '-webkit-mask-origin': {
      fonts: false,
      sample: 'border-box'
    },
    '-webkit-mask-position': {
      fonts: false,
      sample: '0% 0%'
    },
    '-webkit-mask-repeat': {
      fonts: false,
      sample: 'repeat'
    },
    '-webkit-mask-size': {
      fonts: false,
      sample: 'auto'
    },
    '-webkit-print-color-adjust': {
      fonts: false,
      sample: 'economy'
    },
    '-webkit-tap-highlight-color': {
      fonts: false,
      sample: 'rgba(0, 0, 0, 0.18)'
    },
    '-webkit-text-emphasis-color': {
      fonts: false,
      sample: 'rgb(0, 0, 0)'
    },
    '-webkit-text-emphasis-position': {
      fonts: false,
      sample: 'over right'
    },
    '-webkit-text-emphasis-style': {
      fonts: false,
      sample: 'none'
    },
    '-webkit-text-fill-color': {
      fonts: false,
      sample: 'rgb(0, 0, 0)'
    },
    '-webkit-text-stroke-color': {
      fonts: false,
      sample: 'rgb(0, 0, 0)'
    },
    '-webkit-user-drag': {
      fonts: false,
      sample: 'auto'
    },
    '-webkit-user-modify': {
      fonts: false,
      sample: 'read-only'
    },
    'align-items': {
      fonts: false,
      sample: 'flex-end'
    },
    'align-self': {
      fonts: false,
      sample: 'auto'
    },
    'animation-delay': {
      fonts: false,
      sample: '0s'
    },
    'animation-direction': {
      fonts: false,
      sample: 'normal'
    },
    'animation-duration': {
      fonts: false,
      sample: '0s'
    },
    'animation-fill-mode': {
      fonts: false,
      sample: 'none'
    },
    'animation-iteration-count': {
      fonts: false,
      sample: '1'
    },
    'animation-name': {
      fonts: false,
      sample: 'none'
    },
    'animation-play-state': {
      fonts: false,
      sample: 'running'
    },
    'animation-timing-function': {
      fonts: false,
      sample: 'ease'
    },
    'backdrop-filter': {
      fonts: false,
      sample: 'none'
    },
    'backface-visibility': {
      fonts: false,
      sample: 'visible'
    },
    'background-attachment': {
      fonts: false,
      sample: 'scroll'
    },
    'background-blend-mode': {
      fonts: false,
      sample: 'normal'
    },
    'background-clip': {
      fonts: false,
      sample: 'border-box'
    },
    'background-color': {
      fonts: false,
      sample: 'rgba(0, 0, 0, 0)'
    },
    'background-image': {
      fonts: false,
      sample: 'none'
    },
    'background-origin': {
      fonts: false,
      sample: 'padding-box'
    },
    'background-position': {
      fonts: false,
      sample: '0% 0%'
    },
    'background-repeat': {
      fonts: false,
      sample: 'repeat'
    },
    'background-size': {
      fonts: false,
      sample: 'auto'
    },
    'border-bottom-color': {
      fonts: false,
      sample: 'rgb(0, 0, 0)'
    },
    'border-bottom-left-radius': {
      fonts: false,
      sample: '0px'
    },
    'border-bottom-right-radius': {
      fonts: false,
      sample: '0px'
    },
    'border-bottom-style': {
      fonts: false,
      sample: 'none'
    },
    'border-bottom-width': {
      fonts: false,
      sample: '0px'
    },
    'border-collapse': {
      fonts: false,
      sample: 'separate'
    },
    'border-image-outset': {
      fonts: false,
      sample: '0'
    },
    'border-image-repeat': {
      fonts: false,
      sample: 'stretch'
    },
    'border-image-slice': {
      fonts: false,
      sample: '100%'
    },
    'border-image-source': {
      fonts: false,
      sample: 'none'
    },
    'border-image-width': {
      fonts: false,
      sample: '1'
    },
    'border-left-color': {
      fonts: false,
      sample: 'rgb(0, 0, 0)'
    },
    'border-left-style': {
      fonts: false,
      sample: 'none'
    },
    'border-left-width': {
      fonts: false,
      sample: '0px'
    },
    'border-right-color': {
      fonts: false,
      sample: 'rgb(0, 0, 0)'
    },
    'border-right-style': {
      fonts: false,
      sample: 'none'
    },
    'border-right-width': {
      fonts: false,
      sample: '0px'
    },
    'border-top-color': {
      fonts: false,
      sample: 'rgb(0, 0, 0)'
    },
    'border-top-left-radius': {
      fonts: false,
      sample: '0px'
    },
    'border-top-right-radius': {
      fonts: false,
      sample: '0px'
    },
    'border-top-style': {
      fonts: false,
      sample: 'none'
    },
    'border-top-width': {
      fonts: false,
      sample: '0px'
    },
    'bottom': {
      fonts: false,
      sample: 'auto'
    },
    'box-shadow': {
      fonts: false,
      sample: 'inset 5px 3px 11px 2px white, inset -3px -3px 9px 2px #0002'
    },
    'box-sizing': {
      fonts: false,
      sample: 'inherit'
    },
    'buffered-rendering': {
      fonts: false,
      sample: 'auto'
    },
    'clear': {
      fonts: false,
      sample: 'none'
    },
    'clip': {
      fonts: false,
      sample: 'auto'
    },
    'clip-path': {
      fonts: false,
      sample: 'none'
    },
    'clip-rule': {
      fonts: false,
      sample: 'nonzero'
    },
    'color': {
      fonts: false,
      sample: 'rgb(0, 0, 0)'
    },
    'color-interpolation': {
      fonts: false,
      sample: 'srgb'
    },
    'color-interpolation-filters': {
      fonts: false,
      sample: 'linearrgb'
    },
    'color-rendering': {
      fonts: false,
      sample: 'auto'
    },
    'column-count': {
      fonts: false,
      sample: 'auto'
    },
    'column-gap': {
      fonts: false,
      sample: 'normal'
    },
    'column-rule-color': {
      fonts: false,
      sample: 'rgb(0, 0, 0)'
    },
    'column-rule-style': {
      fonts: false,
      sample: 'none'
    },
    'column-rule-width': {
      fonts: false,
      sample: '0px'
    },
    'column-span': {
      fonts: false,
      sample: 'none'
    },
    'column-width': {
      fonts: false,
      sample: 'auto'
    },
    'content': {
      fonts: false,
      sample: 'normal'
    },
    'cursor': {
      fonts: false,
      sample: 'auto'
    },
    'display': {
      fonts: false,
      sample: 'flex'
    },
    'empty-cells': {
      fonts: false,
      sample: 'show'
    },
    'fill': {
      fonts: false,
      sample: 'rgb(0, 0, 0)'
    },
    'fill-opacity': {
      fonts: false,
      sample: '1'
    },
    'fill-rule': {
      fonts: false,
      sample: 'nonzero'
    },
    'filter': {
      fonts: false,
      sample: 'none'
    },
    'flex-basis': {
      fonts: false,
      sample: 'auto'
    },
    'flex-direction': {
      fonts: false,
      sample: 'row'
    },
    'flex-grow': {
      fonts: false,
      sample: '0'
    },
    'flex-shrink': {
      fonts: false,
      sample: '1'
    },
    'flex-wrap': {
      fonts: false,
      sample: 'nowrap'
    },
    'float': {
      fonts: false,
      sample: 'none'
    },
    'flood-color': {
      fonts: false,
      sample: 'rgb(0, 0, 0)'
    },
    'flood-opacity': {
      fonts: false,
      sample: '1'
    },
    'grid-auto-columns': {
      fonts: false,
      sample: 'auto'
    },
    'grid-auto-flow': {
      fonts: false,
      sample: 'row'
    },
    'grid-auto-rows': {
      fonts: false,
      sample: 'auto'
    },
    'grid-column-end': {
      fonts: false,
      sample: 'auto'
    },
    'grid-column-start': {
      fonts: false,
      sample: 'auto'
    },
    'grid-row-end': {
      fonts: false,
      sample: 'auto'
    },
    'grid-row-start': {
      fonts: false,
      sample: 'auto'
    },
    'grid-template-areas': {
      fonts: false,
      sample: 'none'
    },
    'grid-template-columns': {
      fonts: false,
      sample: 'none'
    },
    'grid-template-rows': {
      fonts: false,
      sample: 'none'
    },
    'height': {
      fonts: false,
      sample: 'var(--interplot-line-height)'
    },
    'image-orientation': {
      fonts: false,
      sample: 'from-image'
    },
    'image-rendering': {
      fonts: false,
      sample: 'auto'
    },
    'isolation': {
      fonts: false,
      sample: 'auto'
    },
    'justify-content': {
      fonts: false,
      sample: 'normal'
    },
    'justify-items': {
      fonts: false,
      sample: 'normal'
    },
    'justify-self': {
      fonts: false,
      sample: 'auto'
    },
    'left': {
      fonts: false,
      sample: 'auto'
    },
    'letter-spacing': {
      fonts: false,
      sample: 'normal'
    },
    'lighting-color': {
      fonts: false,
      sample: 'rgb(255, 255, 255)'
    },
    'list-style-image': {
      fonts: false,
      sample: 'none'
    },
    'list-style-position': {
      fonts: false,
      sample: 'outside'
    },
    'list-style-type': {
      fonts: false,
      sample: 'disc'
    },
    'margin-bottom': {
      fonts: false,
      sample: '0mm'
    },
    'margin-left': {
      fonts: false,
      sample: '0mm'
    },
    'margin-right': {
      fonts: false,
      sample: '0mm'
    },
    'margin-top': {
      fonts: false,
      sample: '0mm'
    },
    'marker-end': {
      fonts: false,
      sample: 'none'
    },
    'marker-mid': {
      fonts: false,
      sample: 'none'
    },
    'marker-start': {
      fonts: false,
      sample: 'none'
    },
    'mask': {
      fonts: false,
      sample: 'none'
    },
    'mask-type': {
      fonts: false,
      sample: 'luminance'
    },
    'max-height': {
      fonts: false,
      sample: 'none'
    },
    'max-width': {
      fonts: false,
      sample: 'none'
    },
    'min-height': {
      fonts: false,
      sample: '0px'
    },
    'min-width': {
      fonts: false,
      sample: '0px'
    },
    'mix-blend-mode': {
      fonts: false,
      sample: 'normal'
    },
    'object-fit': {
      fonts: false,
      sample: 'fill'
    },
    'object-position': {
      fonts: false,
      sample: '50% 50%'
    },
    'offset-distance': {
      fonts: false,
      sample: '0px'
    },
    'offset-path': {
      fonts: false,
      sample: 'none'
    },
    'offset-rotate': {
      fonts: false,
      sample: 'auto 0deg'
    },
    'opacity': {
      fonts: false,
      sample: '1'
    },
    'order': {
      fonts: false,
      sample: '0'
    },
    'outline-color': {
      fonts: false,
      sample: 'rgb(0, 0, 0)'
    },
    'outline-offset': {
      fonts: false,
      sample: '0px'
    },
    'outline-style': {
      fonts: false,
      sample: 'none'
    },
    'outline-width': {
      fonts: false,
      sample: '0px'
    },
    'overflow-anchor': {
      fonts: false,
      sample: 'auto'
    },
    'overflow-wrap': {
      fonts: false,
      sample: 'normal'
    },
    'overflow-x': {
      fonts: false,
      sample: 'visible'
    },
    'overflow-y': {
      fonts: false,
      sample: 'visible'
    },
    'padding-bottom': {
      fonts: false,
      sample: '0px'
    },
    'padding-left': {
      fonts: false,
      sample: '0px'
    },
    'padding-right': {
      fonts: false,
      sample: '0px'
    },
    'padding-top': {
      fonts: false,
      sample: '0px'
    },
    'paint-order': {
      fonts: false,
      sample: 'normal'
    },
    'perspective': {
      fonts: false,
      sample: 'none'
    },
    'perspective-origin': {
      fonts: false,
      sample: '0px 0px'
    },
    'pointer-events': {
      fonts: false,
      sample: 'auto'
    },
    'position': {
      fonts: false,
      sample: 'static'
    },
    'resize': {
      fonts: false,
      sample: 'none'
    },
    'right': {
      fonts: false,
      sample: 'auto'
    },
    'row-gap': {
      fonts: false,
      sample: 'normal'
    },
    'scroll-behavior': {
      fonts: false,
      sample: 'auto'
    },
    'shape-image-threshold': {
      fonts: false,
      sample: '0'
    },
    'shape-margin': {
      fonts: false,
      sample: '0px'
    },
    'shape-outside': {
      fonts: false,
      sample: 'none'
    },
    'shape-rendering': {
      fonts: false,
      sample: 'auto'
    },
    'speak': {
      fonts: false,
      sample: 'normal'
    },
    'stop-color': {
      fonts: false,
      sample: 'rgb(0, 0, 0)'
    },
    'stop-opacity': {
      fonts: false,
      sample: '1'
    },
    'stroke': {
      fonts: false,
      sample: 'none'
    },
    'stroke-dasharray': {
      fonts: false,
      sample: 'none'
    },
    'stroke-dashoffset': {
      fonts: false,
      sample: '0px'
    },
    'stroke-linecap': {
      fonts: false,
      sample: 'butt'
    },
    'stroke-linejoin': {
      fonts: false,
      sample: 'miter'
    },
    'stroke-miterlimit': {
      fonts: false,
      sample: '4'
    },
    'stroke-opacity': {
      fonts: false,
      sample: '1'
    },
    'stroke-width': {
      fonts: false,
      sample: '1px'
    },
    'table-layout': {
      fonts: false,
      sample: 'auto'
    },
    'top': {
      fonts: false,
      sample: 'auto'
    },
    'touch-action': {
      fonts: false,
      sample: 'auto'
    },
    'transform': {
      fonts: false,
      sample: 'none'
    },
    'transform-origin': {
      fonts: false,
      sample: '0px 0px'
    },
    'transform-style': {
      fonts: false,
      sample: 'flat'
    },
    'transition-delay': {
      fonts: false,
      sample: '0s'
    },
    'transition-duration': {
      fonts: false,
      sample: '0s'
    },
    'transition-property': {
      fonts: false,
      sample: 'all'
    },
    'transition-timing-function': {
      fonts: false,
      sample: 'ease'
    },
    'user-select': {
      fonts: false,
      sample: 'auto'
    },
    'vector-effect': {
      fonts: false,
      sample: 'none'
    },
    'vertical-align': {
      fonts: false,
      sample: 'baseline'
    },
    'visibility': {
      fonts: false,
      sample: 'visible'
    },
    'width': {
      fonts: false,
      sample: 'auto'
    },
    'will-change': {
      fonts: false,
      sample: 'auto'
    },
    'z-index': {
      fonts: false,
      sample: 'auto'
    },
    '-webkit-font-smoothing': {
      fonts: null,
      sample: 'auto'
    },
    '-webkit-hyphenate-character': {
      fonts: null,
      sample: 'auto'
    },
    '-webkit-line-break': {
      fonts: null,
      sample: 'auto'
    },
    '-webkit-line-clamp': {
      fonts: null,
      sample: 'none'
    },
    '-webkit-locale': {
      fonts: null,
      sample: 'auto'
    },
    '-webkit-rtl-ordering': {
      fonts: null,
      sample: 'logical'
    },
    '-webkit-text-combine': {
      fonts: null,
      sample: 'none'
    },
    '-webkit-text-decorations-in-effect': {
      fonts: null,
      sample: 'none'
    },
    '-webkit-text-orientation': {
      fonts: null,
      sample: 'vertical-right'
    },
    '-webkit-text-security': {
      fonts: null,
      sample: 'none'
    },
    '-webkit-text-stroke-width': {
      fonts: null,
      sample: '0px'
    },
    '-webkit-writing-mode': {
      fonts: null,
      sample: 'horizontal-tb'
    },
    'align-content': {
      fonts: null,
      sample: 'normal'
    },
    'alignment-baseline': {
      fonts: null,
      sample: 'auto'
    },
    'baseline-shift': {
      fonts: null,
      sample: '0px'
    },
    'break-after': {
      fonts: null,
      sample: 'auto'
    },
    'break-before': {
      fonts: null,
      sample: 'auto'
    },
    'break-inside': {
      fonts: null,
      sample: 'auto'
    },
    'caption-side': {
      fonts: null,
      sample: 'top'
    },
    'direction': {
      fonts: null,
      sample: 'ltr'
    },
    'dominant-baseline': {
      fonts: null,
      sample: 'auto'
    },
    'hyphens': {
      fonts: null,
      sample: 'manual'
    },
    'line-height': {
      fonts: null,
      sample: '18.8976px'
    },
    'orphans': {
      fonts: null,
      sample: '2'
    },
    'tab-size': {
      fonts: null,
      sample: '8'
    },
    'text-align': {
      fonts: null,
      sample: 'left'
    },
    'text-align-last': {
      fonts: null,
      sample: 'left'
    },
    'text-anchor': {
      fonts: null,
      sample: 'start'
    },
    'text-decoration': {
      fonts: null,
      sample: 'none solid rgb(0, 0, 0)'
    },
    'text-decoration-color': {
      fonts: null,
      sample: 'rgb(0, 0, 0)'
    },
    'text-decoration-line': {
      fonts: null,
      sample: 'none'
    },
    'text-decoration-skip-ink': {
      fonts: null,
      sample: 'auto'
    },
    'text-decoration-style': {
      fonts: null,
      sample: 'solid'
    },
    'text-indent': {
      fonts: null,
      sample: '0px'
    },
    'text-overflow': {
      fonts: null,
      sample: 'clip'
    },
    'text-rendering': {
      fonts: null,
      sample: 'geometricprecision'
    },
    'text-shadow': {
      fonts: null,
      sample: 'none'
    },
    'text-size-adjust': {
      fonts: null,
      sample: 'auto'
    },
    'text-transform': {
      fonts: null,
      sample: 'none'
    },
    'text-underline-position': {
      fonts: null,
      sample: 'auto'
    },
    'unicode-bidi': {
      fonts: null,
      sample: 'normal'
    },
    'white-space': {
      fonts: null,
      sample: 'nowrap'
    },
    'widows': {
      fonts: null,
      sample: '2'
    },
    'word-break': {
      fonts: null,
      sample: 'normal'
    },
    'word-spacing': {
      fonts: null,
      sample: '0px'
    },
    'writing-mode': {
      fonts: null,
      sample: 'horizontal-tb'
    },
    'zoom': {
      fonts: null,
      sample: '1'
    },
    'font-family': {
      fonts: true,
      sample: 'flow, fallback'
    },
    'font-kerning': {
      fonts: true,
      sample: 'auto'
    },
    'font-optical-sizing': {
      fonts: true,
      sample: 'auto'
    },
    'font-size': {
      fonts: true,
      sample: '15.1181px'
    },
    'font-stretch': {
      fonts: true,
      sample: '100%'
    },
    'font-style': {
      fonts: true,
      sample: 'normal'
    },
    'font-variant': {
      fonts: true,
      sample: 'normal'
    },
    'font-variant-caps': {
      fonts: true,
      sample: 'normal'
    },
    'font-variant-east-asian': {
      fonts: true,
      sample: 'normal'
    },
    'font-variant-ligatures': {
      fonts: true,
      sample: 'normal'
    },
    'font-variant-numeric': {
      fonts: true,
      sample: 'normal'
    },
    'font-weight': {
      fonts: true,
      sample: '400'
    }
  };

}).call(this);

//# sourceMappingURL=css-properties.js.map