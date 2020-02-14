(function() {
  // cannot 'use strict'

  //###########################################################################################################
  var CND, H, HTML, INTERTEXT, alert, badge, css, datoms_as_html, debug, dhtml, help, info, isa, log, raw, rpr, script, text, type_of, types, urge, validate, warn, whisper;

  CND = require('cnd');

  rpr = CND.rpr.bind(CND);

  badge = 'INTERPLOT/TEMPLATE-ELEMENTS';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  //...........................................................................................................
  types = require('./types');

  ({isa, validate, type_of} = types);

  //...........................................................................................................
  INTERTEXT = require('intertext');

  ({HTML} = INTERTEXT);

  ({datoms_as_html, raw, text, script, css, dhtml} = HTML.export());

  H = dhtml;

  // #-----------------------------------------------------------------------------------------------------------
  // tag_registry = {}
  // id_from_tagname = ( tagname ) ->
  //   count = tag_registry[ tagname ] = ( tag_registry[ tagname ] ?= 0 ) + 1
  //   return "#{tagname}#{count}"

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  /* Unique elements: */
  this.unstyledelement = function(...P) {
    return [H('unstyledelement#unstyledelement', ...P)];
  };

  this.tabletop = function(...P) {
    return [H('tabletop#tabletop', ...P)];
  };

  this.zoomer = function(...P) {
    return [H('zoomer#zoomer', ...P)];
  };

  this.pointer = function(...P) {
    return [H('pointer#pointer', ...P)];
  };

  //-----------------------------------------------------------------------------------------------------------
  this.grid = function(...P) {
    return [H('grid', ...P)];
  };

  this.artboard = function(...P) {
    return [H('artboard', ...P)];
  };

  this.artboard = function(...P) {
    return [H('artboard', ...P)];
  };

  //...........................................................................................................
  this.box = function(...P) {
    return [H('box', ...P)];
  };

  this.hbox = function(...P) {
    return [H('hbox', ...P)];
  };

  this.hgap = function(...P) {
    return [H('hgap', ...P)];
  };

  this.vbox = function(...P) {
    return [H('vbox', ...P)];
  };

  this.vgap = function(...P) {
    return [H('vgap', ...P)];
  };

  this.xhgap = function(...P) {
    return [H('xhgap', ...P)];
  };

  this.topmargin = function(...P) {
    return [H('topmargin', ...P)];
  };

  this.bottommargin = function(...P) {
    return [H('bottommargin', ...P)];
  };

  this.leftmargin = function(...P) {
    return [H('leftmargin', ...P)];
  };

  this.rightmargin = function(...P) {
    return [H('rightmargin', ...P)];
  };

  this.column = function(...P) {
    return [H('column', ...P)];
  };

  this.slug = function(...P) {
    return [H('slug', this.trim(), ...P)];
  };

  this.trim = function(...P) {
    return [H('trim', ...P)];
  };

  //-----------------------------------------------------------------------------------------------------------
  this.dom_element_selector_generator = function() {
    return [
      //.......................................................................................................
      /* https://github.com/fczbkk/css-selector-generator */
      script('../fczbkk-css-selector-generator.js'),
      /* TAINT path not properly resolved */
      script(function() {
        return ($(document)).ready(function() {
          var sg;
          sg = new CssSelectorGenerator();
          globalThis.selector_of = function(node) {
            return sg.getSelector(as_dom_node(node));
          };
          return null;
        });
      })
    ];
  };

  //-----------------------------------------------------------------------------------------------------------
  //.......................................................................................................
  this.toolbox = function() {
    var R;
    R = [];
    R.push(script(function() {
      return ($(document)).ready(function() {
        var debugonoff_jq, zoomer_jq, zoomin_jq, zoomout_jq;
        globalThis.toolbox = {};
        toolbox.debugonoff_jq = debugonoff_jq = $('#debugonoff');
        toolbox.zoomin_jq = zoomin_jq = $('#zoomin');
        toolbox.zoomout_jq = zoomout_jq = $('#zoomout');
        toolbox.zoomer_jq = zoomer_jq = $('#zoomer');
        // zoomer_jq.css 'transform-origin', "top left"
        //.......................................................................................................
        debugonoff_jq.on('click', function() {
          return ($('body')).toggleClass('debug');
        });
        //.......................................................................................................
        /* TAINT should use CSS animations */
        zoomin_jq.on('click', function() {
          var current_zoom;
          current_zoom = parseFloat(zoomer_jq.css('zoom'));
          return zoomer_jq.animate({
            zoom: current_zoom * 1.25
          }, 150, 'linear');
        });
        //.......................................................................................................
        zoomout_jq.on('click', function() {
          var current_zoom;
          // zoomer_jq.css 'transform-origin', "top left"
          current_zoom = parseFloat(zoomer_jq.css('zoom'));
          return zoomer_jq.animate({
            zoom: current_zoom / 1.25
          }, 150, 'linear');
        });
        //.......................................................................................................
        return null;
      });
    }));
    R.push(H('toolbox.gui', [H('button#debugonoff.gui', "dbg"), H('button#zoomout.gui', "z–"), H('button#zoomin.gui', "z+")]));
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.page = function(settings, content) {
    var defaults, id, leftright, page;
    defaults = {
      pagenr: 0
    };
    settings = {...defaults, ...settings};
    id = `page${settings.pagenr}`;
    leftright = (isa.even(settings.pagenr)) ? 'left' : 'right';
    page = [];
    page.push(H('earmark', `${settings.pagenr}`));
    page.push(H('paper'));
    page.push(H('chase', content));
    return H(`page#${id}.${leftright}`, page);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.gauge = function() {
    var R;
    R = [];
    R.push(H('style', `gauge#gauge {
  display:                block;
  position:               absolute;
  top:                    10mm;
  left:                   0mm;
  width:                  10mm;
  min-width:              10mm;
  max-width:              10mm;
  height:                 10mm;
  min-height:             10mm;
  max-height:             10mm;
  mix-blend-mode:         multiply;
  backdrop-filter:        blur(0.2mm);
  background-color:       #ab2865; }
@media print{ gauge#gauge { display: none; } }`));
    //.........................................................................................................
    R.push(script(function() {
      return ($(document)).ready(function() {
        var f;
        f = function() {
          var cmgauge_jq;
          cmgauge_jq = $('gauge#gauge');
          this.px_per_mm = cmgauge_jq.width() / 10;
          this.mm_per_px = 1 / this.px_per_mm;
          this.px_from_mm = function(mm) {
            return mm * this.px_per_mm;
          };
          this.mm_from_px = function(px) {
            return px * this.mm_per_px;
          };
          this.width_mm_of = function(node) {
            return this.mm_from_px((as_dom_node(node)).getBoundingClientRect().width);
          };
          return this.height_mm_of = function(node) {
            return this.mm_from_px((as_dom_node(node)).getBoundingClientRect().height);
          };
        };
        f.apply(globalThis.GAUGE = {});
        return null;
      });
    }));
    //.........................................................................................................
    R.push(H('gauge#gauge.gui.draggable'));
    return R;
  };

}).call(this);
