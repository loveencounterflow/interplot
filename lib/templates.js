(function() {
  // cannot 'use strict'

  //###########################################################################################################
  var CND, TEACUP, _, alert, badge, debug, help, info, log, njs_fs, njs_path, rpr, urge, warn, whisper;

  njs_path = require('path');

  njs_fs = require('fs');

  //...........................................................................................................
  CND = require('cnd');

  rpr = CND.rpr.bind(CND);

  badge = '明快打字机/TEMPLATES';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  //...........................................................................................................
  // MKTS                      = require './main'
  TEACUP = require('coffeenode-teacup');

  // CHR                       = require 'coffeenode-chr'
  //...........................................................................................................
  // _STYLUS                   = require 'stylus'
  // as_css                    = STYLUS.render.bind STYLUS
  // style_route               = njs_path.join __dirname, '../src/mingkwai-typesetter.styl'
  // css                       = as_css njs_fs.readFileSync style_route, encoding: 'utf-8'
  //...........................................................................................................

  //===========================================================================================================
  // TEACUP NAMESPACE ACQUISITION
  //-----------------------------------------------------------------------------------------------------------
  _ = TEACUP;

  // #-----------------------------------------------------------------------------------------------------------
  // _.FULLHEIGHTFULLWIDTH  = @new_tag ( P... ) -> _.TAG 'fullheightfullwidth', P...
  // _.OUTERGRID            = @new_tag ( P... ) -> _.TAG 'outergrid',           P...
  // _.LEFTBAR              = @new_tag ( P... ) -> _.TAG 'leftbar',             P...
  // _.CONTENT              = @new_tag ( P... ) -> _.TAG 'content',             P...
  // _.RIGHTBAR             = @new_tag ( P... ) -> _.TAG 'rightbar',            P...
  // _.SHADE                = @new_tag ( P... ) -> _.TAG 'shade',               P...
  // _.SCROLLER             = @new_tag ( P... ) -> _.TAG 'scroller',            P...
  // _.BOTTOMBAR            = @new_tag ( P... ) -> _.TAG 'bottombar',           P...
  // _.FOCUSFRAME           = @new_tag ( P... ) -> _.TAG 'focusframe',          P...
  //...........................................................................................................
  _.JS = _.new_tag(function(route) {
    return _.SCRIPT({
      type: 'text/javascript',
      src: route
    });
  });

  _.CSS = _.new_tag(function(route) {
    return _.LINK({
      rel: 'stylesheet',
      href: route
    });
  });

  // _.STYLUS               = ( source ) -> _.STYLE {}, _STYLUS.render source

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  // @get_flexgrid_html = ( cdtsel_nr, term ) ->
  //   selector = if cdtsel_nr is 1 then '.cdtsel' else ''
  //   ### TAINT use API to derive cdtsel_id ###
  //   return @render => _.DIV "#candidate-#{cdtsel_nr}.glyph#{selector}", term

  //-----------------------------------------------------------------------------------------------------------
  this.layout = function(title) {
    return _.render(() => {
      _.DOCTYPE(5);
      _.META({
        charset: 'utf-8'
      });
      // _.META 'http-equiv': "Content-Security-Policy", content: "default-src 'self'"
      // _.META 'http-equiv': "Content-Security-Policy", content: "script-src 'unsafe-inline'"
      _.TITLE(title != null ? title : 'INTERPLOT');
      /* ------------------------------------------------------------------------------------------------ */
      _.JS('./jquery-3.3.1.js');
      // _.CSS    './reset.css'
      _.CSS('./styles.css');
      /* ------------------------------------------------------------------------------------------------ */
      /* LIBRARIES                                                                                       */
      // _.JS  'http://d3js.org/d3.v4.js'
      // _.JS  'http://d3js.org/d3.v5.js'
      // _.JS   './d3.v5.js'
      // _.JS   'https://cdn.jsdelivr.net/npm/taucharts@2/dist/taucharts.min.js'
      // _.CSS  'https://cdn.jsdelivr.net/npm/taucharts@2/dist/taucharts.min.css'
      // _.CSS './c3-0.6.14/c3.css'
      // _.JS  './c3-0.6.14/c3.min.js'
      //=======================================================================================================
      _.JS('./ops.js');
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.main_2 = function() {
    var arity;
    if ((arity = arguments.length) !== 0) {
      throw new Error(`^33211^ expected 0 arguments, got ${arity}`);
    }
    return (this.layout('Triangular Chart')) + '\n\n' + _.render(() => {
      _.JS('https://cdn.plot.ly/plotly-latest.min.js');
      _.CSS('./chart-styles.css');
      _.CSS('https://fonts.googleapis.com/css?family=Lobster');
      _.DIV('#chart');
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.demo_columns = function() {
    var arity;
    if ((arity = arguments.length) !== 0) {
      throw new Error(`^33211^ expected 0 arguments, got ${arity}`);
    }
    return (this.layout('Columns Demo')) + '\n\n' + _.render(() => {
      return _.JS('https://cdn.plot.ly/plotly-latest.min.js');
    });
  };

}).call(this);
