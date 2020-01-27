(function() {
  // cannot 'use strict'

  //###########################################################################################################
  var CND, FS, PATH, TEACUP, _, alert, badge, debug, help, id_from_tagname, info, insert, log, rpr, tag_registry, urge, warn, whisper,
    modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

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
  PATH = require('path');

  FS = require('fs');

  TEACUP = require('coffeenode-teacup');

  // CHR                       = require 'coffeenode-chr'
  //...........................................................................................................
  // _STYLUS                   = require 'stylus'
  // as_css                    = STYLUS.render.bind STYLUS
  // style_route               = PATH.join __dirname, '../src/mingkwai-typesetter.styl'
  // css                       = as_css FS.readFileSync style_route, encoding: 'utf-8'
  //...........................................................................................................

  //===========================================================================================================
  // TEACUP NAMESPACE ACQUISITION
  //-----------------------------------------------------------------------------------------------------------
  _ = TEACUP;

  // #-----------------------------------------------------------------------------------------------------------
  _.TABLETOP = _.new_tag(function(...P) {
    return _.TAG('tabletop', ...P);
  });

  _.GRID = _.new_tag(function(...P) {
    return _.TAG('grid', ...P);
  });

  // _.FULLHEIGHTFULLWIDTH = _.new_tag ( P... ) -> _.TAG 'fullheightfullwidth', P...
  // _.OUTERGRID           = _.new_tag ( P... ) -> _.TAG 'outergrid',           P...
  // _.LEFTBAR             = _.new_tag ( P... ) -> _.TAG 'leftbar',             P...
  // _.CONTENT             = _.new_tag ( P... ) -> _.TAG 'content',             P...
  // _.RIGHTBAR            = _.new_tag ( P... ) -> _.TAG 'rightbar',            P...
  // _.SHADE               = _.new_tag ( P... ) -> _.TAG 'shade',               P...
  // _.SCROLLER            = _.new_tag ( P... ) -> _.TAG 'scroller',            P...
  // _.BOTTOMBAR           = _.new_tag ( P... ) -> _.TAG 'bottombar',           P...
  // _.FOCUSFRAME          = _.new_tag ( P... ) -> _.TAG 'focusframe',          P...
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
  //...........................................................................................................
  _.ARTBOARD = _.new_tag(function(...P) {
    return _.TAG('artboard', ...P);
  });

  _.TRIM = _.new_tag(function(...P) {
    return _.TAG('trim', ...P);
  });

  _.ZOOMER = _.new_tag(function(...P) {
    return _.TAG('zoomer', ...P);
  });

  //...........................................................................................................
  _.BOX = _.new_tag(function(...P) {
    return _.TAG('box', ...P);
  });

  _.COLUMN = _.new_tag(function(...P) {
    return _.TAG('column', ...P);
  });

  _.HBOX = _.new_tag(function(...P) {
    return _.TAG('hbox', ...P);
  });

  _.HGAP = _.new_tag(function(...P) {
    return _.TAG('hgap', ...P);
  });

  _.VBOX = _.new_tag(function(...P) {
    return _.TAG('vbox', ...P);
  });

  _.VGAP = _.new_tag(function(...P) {
    return _.TAG('vgap', ...P);
  });

  _.XHGAP = _.new_tag(function(...P) {
    return _.TAG('xhgap', ...P);
  });

  _.TOPMARGIN = _.new_tag(function(...P) {
    return _.TAG('topmargin', ...P);
  });

  _.BOTTOMMARGIN = _.new_tag(function(...P) {
    return _.TAG('bottommargin', ...P);
  });

  _.LEFTMARGIN = _.new_tag(function(...P) {
    return _.TAG('leftmargin', ...P);
  });

  _.RIGHTMARGIN = _.new_tag(function(...P) {
    return _.TAG('rightmargin', ...P);
  });

  //-----------------------------------------------------------------------------------------------------------
  _.TOOLBOX = function() {
    _.COFFEESCRIPT(function() {
      return ($(document)).ready(function() {
        var debugonoff_jq, zoomer_jq, zoomin_jq, zoomout_jq;
        globalThis.toolbox = {};
        toolbox.debugonoff_jq = debugonoff_jq = $('#debugonoff');
        toolbox.zoomin_jq = zoomin_jq = $('#zoomin');
        toolbox.zoomout_jq = zoomout_jq = $('#zoomout');
        toolbox.zoomer_jq = zoomer_jq = $('#zoomer');
        // zoomer_jq.css 'transform-origin', "top left"
        //.....................................................................................................
        debugonoff_jq.on('click', function() {
          return ($('body')).toggleClass('debug');
        });
        //.....................................................................................................
        /* TAINT should use CSS animations */
        zoomin_jq.on('click', function() {
          var current_zoom;
          current_zoom = parseFloat(zoomer_jq.css('zoom'));
          return zoomer_jq.animate({
            zoom: current_zoom * 1.25
          }, 150, 'linear');
        });
        //.....................................................................................................
        zoomout_jq.on('click', function() {
          var current_zoom;
          // zoomer_jq.css 'transform-origin', "top left"
          current_zoom = parseFloat(zoomer_jq.css('zoom'));
          return zoomer_jq.animate({
            zoom: current_zoom / 1.25
          }, 150, 'linear');
        });
        //.....................................................................................................
        return null;
      });
    });
    return _.TAG('toolbox', '.gui', function() {
      _.BUTTON('#debugonoff.gui', "dbg");
      _.BUTTON('#zoomout.gui', "z–");
      return _.BUTTON('#zoomin.gui', "z+");
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  _.SLUG = this.slug = _.new_tag(function() {
    return _.TAG('slug', function() {
      return _.TRIM();
    });
  });

  //-----------------------------------------------------------------------------------------------------------
  _.UNSTYLEDELEMENT = _.new_tag(function() {
    return _.TAG('unstyledelement');
  });

  // _.TAG 'slug', -> _.TRIM { contenteditable: 'true', }

  //-----------------------------------------------------------------------------------------------------------
  tag_registry = {};

  id_from_tagname = function(tagname) {
    var count;
    count = tag_registry[tagname] = (tag_registry[tagname] != null ? tag_registry[tagname] : tag_registry[tagname] = 0) + 1;
    return `${tagname}${count}`;
  };

  //-----------------------------------------------------------------------------------------------------------
  _._SLUGCONTAINER = _.new_tag(function(tagname, settings) {
    /* TAINT lineheight false assumed to be 10mm */
    var defaults, height, id, ref, style;
    defaults = {
      width: '150mm',
      style: null,
      slugcount: 2,
      empty: false
    };
    settings = {...defaults, ...settings};
    style = `max-width:${settings.width};` + ((ref = settings.style) != null ? ref : '');
    if (settings.empty) {
      height = `${settings.slugcount * 10}mm`;
      style += `height:${height};max-height:${height};`;
    }
    id = id_from_tagname(tagname);
    _.TAG(tagname, {
      id,
      style,
      'data-slugcount': settings.slugcount
    }, function() {
      var i, nr, ref1, results;
      if (!settings.empty) {
        results = [];
        for (nr = i = 1, ref1 = settings.slugcount; i <= ref1; nr = i += +1) {
          results.push(_.SLUG());
        }
        return results;
      }
    });
    return null;
  });

  //-----------------------------------------------------------------------------------------------------------
  _.PAGE = function(settings, content) {
    var clasz, defaults, id;
    defaults = {
      pagenr: 0
    };
    settings = {...defaults, ...settings};
    id = `page${settings.pagenr}`;
    clasz = (modulo(settings.pagenr, 2) === 0) ? 'left' : 'right';
    return _.TAG('page', {
      id,
      class: clasz
    }, function() {
      _.TAG('earmark', function() {
        return `${settings.pagenr}`;
      });
      _.TAG('paper');
      return _.TAG('chase', function() {
        if ((typeof content) === 'function') {
          return content();
        }
      });
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  _.GALLEY = _.new_tag(function(settings) {
    return _._SLUGCONTAINER('galley', settings);
  });

  //-----------------------------------------------------------------------------------------------------------
  _.GAUGE = _.new_tag(function() {
    _.STYLE("gauge {\n  display:                block;\n  position:               absolute;\n  top:                    10mm;\n  left:                   0mm;\n  width:                  10mm;\n  min-width:              10mm;\n  max-width:              10mm;\n  height:                 10mm;\n  min-height:             10mm;\n  max-height:             10mm;\n  background:             repeating-linear-gradient(-45deg,#606dbc80,#606dbc80 10px,#46529880 10px,#46529880 20px); }\n@media print{ gauge { display: none; } }\n");
    _.COFFEESCRIPT(function() {
      return ($(document)).ready(function() {
        var f;
        //.....................................................................................................
        f = function() {
          var cmgauge_jq;
          cmgauge_jq = $('gauge');
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
        //.....................................................................................................
        f.apply(globalThis.GAUGE = {});
        return null;
      });
    });
    return _.TAG('gauge', '.gui');
  });

  //-----------------------------------------------------------------------------------------------------------
  _.selector_generator = function() {
    _.JS('../fczbkk-css-selector-generator.js');
/* https://github.com/fczbkk/css-selector-generator */    return _.COFFEESCRIPT(function() {
      return ($(document)).ready(function() {
        var sg;
        sg = new CssSelectorGenerator;
        globalThis.selector_of = function(node) {
          return sg.getSelector(as_dom_node(node));
        };
        return null;
      });
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  insert = function(layout, content) {
    return layout.replace(/%content%/g, content);
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  // @get_flexgrid_html = ( cdtsel_nr, term ) ->
  //   selector = if cdtsel_nr is 1 then '.cdtsel' else ''
  //   ### TAINT use API to derive cdtsel_id ###
  //   return @render => _.DIV "#candidate-#{cdtsel_nr}.glyph#{selector}", term

  //-----------------------------------------------------------------------------------------------------------
  this.layout = function(settings) {
    /* TAINT use intertype for defaults */
    var defaults, public_path, resolve;
    public_path = PATH.resolve(PATH.join(__dirname, '../public'));
    defaults = {
      title: 'INTERPLOT',
      base_path: public_path,
      body_def: '' // may contain CSS-selector-like string, e.g. '.default', '#bodyid42.foo.bar'
    };
    settings = {...defaults, ...settings};
    settings.base_path = PATH.resolve(settings.base_path);
    resolve = (path) => {
      return PATH.relative(settings.base_path, PATH.join(public_path, path));
    };
    //.........................................................................................................
    return _.render(() => {
      _.DOCTYPE(5);
      _.META({
        charset: 'utf-8'
      });
      // _.META 'http-equiv': "Content-Security-Policy", content: "default-src 'self'"
      // _.META 'http-equiv': "Content-Security-Policy", content: "script-src 'unsafe-inline'"
      _.TITLE(settings.title);
      /* ------------------------------------------------------------------------------------------------ */
      _.JS(resolve('./jquery-3.4.1.js'));
      _.JS(resolve('./ops-globals.js'));
      _.JS(resolve('./ops.js'));
      _.CSS(resolve('./reset.css'));
      _.CSS(resolve('./styles.css'));
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
      _.BODY(settings.body_def, function() {
        _.RAW('\n\n%content%\n\n');
        return _.SPAN('#page-ready');
      });
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.main_2 = function() {
    var arity, content, layout;
    if ((arity = arguments.length) !== 0) {
      throw new Error(`^33211^ expected 0 arguments, got ${arity}`);
    }
    layout = this.layout('Triangular Chart');
    content = _.render(() => {
      _.JS(resolve('./ops-plotter.js'));
      /* TAINT `resolve()` not defined here */      _.JS('https://cdn.plot.ly/plotly-latest.min.js');
      _.CSS('./chart-styles.css');
      _.CSS('https://fonts.googleapis.com/css?family=Lobster');
      _.DIV('#chart');
      return null;
    });
    return insert(layout, content);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.tabletop = function(page_count) {
    return _.render(() => {
      return _.TABLETOP(() => {
        return _.GRID('.foo', () => {
          return _.PAGE(() => {
            return '%content%';
          });
        });
      });
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.demo_columns = function() {
    var arity, content, content_path, demo_path, extras, layout, tabletop;
    if ((arity = arguments.length) !== 0) {
      throw new Error(`^33211^ expected 0 arguments, got ${arity}`);
    }
    demo_path = PATH.resolve(PATH.join(__dirname, '../public/demo-columns'));
    content_path = PATH.join(demo_path, 'content.html');
    layout = this.layout({
      title: 'Columns Demo',
      base_path: PATH.resolve(demo_path)
    });
    tabletop = insert(layout, this.tabletop(4));
    extras = _.render(() => {
      return _.CSS('./styles.css');
    });
    content = FS.readFileSync(content_path, {
      encoding: 'utf-8'
    });
    return insert(tabletop, extras + content);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.demo_galley = function() {
    var arity, base_path, body_def, content, layout, layout_settings, title;
    if ((arity = arguments.length) !== 0) {
      throw new Error(`^33211^ expected 0 arguments, got ${arity}`);
    }
    base_path = PATH.resolve(PATH.join(__dirname, '../public/demo-galley'));
    title = 'Galley Demo';
    body_def = '.debug';
    layout_settings = {title, base_path, body_def};
    layout = this.layout(layout_settings);
    content = _.render(() => {
      _.selector_generator();
      _.CSS('./galley.css');
      // _.COFFEESCRIPT ->
      //   ( $ window ).on 'resize', ( event ) ->
      //     log '^29000^', "resize", event
      //     log window.devicePixelRatio
      //     window.devicePixelRatio = 1
      //     # ( $ '#zoomer' ).css 'zoom', 1 / window.devicePixelRatio
      //     event.preventDefault()
      //     return false
      //.......................................................................................................
      _.UNSTYLEDELEMENT();
      _.GAUGE();
      _.TOOLBOX();
      //.......................................................................................................
      return _.ARTBOARD('#artboard1.pages', function() {
        return _.ZOOMER('#zoomer', function() {
          // _.TAG 'page', { pagenr: 0, }
          //.......................................................................................................
          _.PAGE({
            pagenr: 1
          }, function() {
            _.TOPMARGIN();
            _.HBOX(function() {
              _.LEFTMARGIN();
              _.COLUMN();
              _.VGAP();
              _.COLUMN();
              _.VGAP();
              _.COLUMN();
              return _.RIGHTMARGIN();
            });
            return _.BOTTOMMARGIN();
          });
          // #.......................................................................................................
          // _.PAGE { pagenr: 3, }, ->
          //   _.GALLEY    { width: '150mm', slugcount: 25,  empty: true, }
          //.......................................................................................................
          _.PAGE({
            pagenr: 4
          }, function() {
            return _.TAG('demo-paragraph', {
              id: 'd1',
              contenteditable: 'true'
            }, "自馮瀛王");
          });
          //.......................................................................................................
          _.PAGE({
            pagenr: 5
          }, function() {
            //.......................................................................................................
            return _.TAG('demo-paragraph', {
              id: 'd2',
              contenteditable: 'true'
            }, "䷼䷽䷾䷿䷼䷽䷾䷿䷼䷽おきみつおきかずこううんじおきひでこうえいおきながカキクケオイロハニオヘトキュウカッパダッテ\n亥核帝六今令户戶京立音言主文一丁丂國七丄種从虫䜌聲한국어조선말ABC123縉鄑戬戩虚虛嘘噓墟任廷呈程草花\n敬寬茍苟慈没殁沒歿芟投般咎昝晷倃卧臥虎微秃丸常當尚尙區陋沿匚匡亡匸匿龍祗萬禽宫宮侣營麻術述刹新案\n條寨甚商罕深差茶採某也的害編真直值縣祖概鄉者良鬼龜過骨為爲益温溫穴空舟近雞食搵絕丟丢曾𠔃兮清前有\n半平內内羽非邦亠詽訮刊方兌兑马馬\nあいうえおか〇〡〢〣〤〥〦〧〨〩〸〹〺㐀㐁㐂一丁丂豈更車並况全𗀀𗀁𗀂𘠄𘠅𘠆𘠇𘠈𘠉𘠊𛅰𛅱𛅲𛅳\n⾱⾲⾳⾴\n其法用膠泥刻字，薄如錢唇，每字為一印，火燒令堅。先設一鐵版，其上以松脂臘和紙灰之類冒之。\n其法用膠泥刻字、^薄如錢唇、^每字為一印、^火燒令堅。先設一鐵版、^其上以松脂臘和紙灰之類冒之。\nYaffir rectangle刻文字apostolary. Letterpress printing is a technique of relief printing using a printing press.\n自馮瀛王始印五經已後典籍皆為版本其法用膠泥刻字");
          });
          //.......................................................................................................
          _.PAGE({
            pagenr: 6
          }, function() {
            //.......................................................................................................
            return _.TAG('galley', {
              style: "max-width: 150mm"
            }, function() {
              return _.TAG('slug', {
                style: "max-width: 150mm"
              }, function() {
                /* thx to https://stackoverflow.com/a/30526943/7568091 */
                return _.TAG('trim', {
                  style: "display:flex;",
                  contenteditable: 'true'
                }, function() {
                  _.RAW('自');
                  _.TAG('g');
                  _.RAW('馮');
                  _.TAG('g');
                  _.RAW('瀛');
                  _.TAG('g');
                  return _.RAW('王');
                });
              });
            });
          });
          // _.RAW '始'
          // _.RAW '印'
          // _.RAW '五'
          // _.RAW '經'
          // _.RAW '已'
          // _.RAW '後'
          // _.RAW '典'
          // _.RAW '籍'
          // _.RAW '皆'
          // _.RAW '為'
          // _.RAW '版'
          // _.RAW '本'
          // _.RAW '其'
          // _.RAW '法'
          // _.RAW '用'
          // _.RAW '膠'
          // _.RAW '泥'
          // _.RAW '刻'
          // _.RAW '字'
          //.......................................................................................................
          _.PAGE({
            pagenr: 7
          }, function() {
            //.......................................................................................................
            return _.TAG('demo-paragraph', {
              id: 'd3',
              contenteditable: 'true'
            }, function() {
              var i, results;
              results = [];
              for (var i = 0; i <= 3; i++) {
                results.push(_.RAW("<strong style='color:red;'>galley</strong> <em>(n.)</em> 13c., \"sea&shy;going ves&shy;sel ha&shy;ving\nboth sails and oars,\" from Old French ga&shy;lie, ga&shy;lee \"boat, war&shy;ship, gal&shy;ley,\" from\nMedi&shy;eval Latin ga&shy;lea or Ca&shy;ta&shy;lan ga&shy;lea, from Late Greek ga&shy;lea, of\nun&shy;known ori&shy;gin. The word has made its way into most Wes&shy;tern Eu&shy;ro&shy;pe&shy;an\nlan&shy;gua&shy;ges. Ori&shy;gi&shy;nal&shy;ly \"low, flat-built sea&shy;going ves&shy;sel of one\ndeck,\" once a com&shy;mon type in the Me&shy;di&shy;ter&shy;ra&shy;ne&shy;an. Mean&shy;ing\n\"cook&shy;ing range or cook&shy;ing room on a ship\" dates from 1750. The prin&shy;t&shy;ing sense of\ngal&shy;ley, \"ob&shy;long tray that holds the type once set,\" is from 1650s, from French ga&shy;lée in\nthe same sense, in re&shy;f&shy;er&shy;en&shy;ce to the shape of the tray. As a short form of\ngalley-proof it is at&shy;tes&shy;ted from 1890. "));
              }
              return results;
            });
          });
          //.......................................................................................................
          _.PAGE({
            pagenr: 8
          });
          _.PAGE({
            pagenr: 9
          });
          return _.PAGE({
            pagenr: 10
          });
        });
      });
    });
    //.........................................................................................................
    return insert(layout, content);
  };

  // debug ( k for k of _ ).sort().join ' '; process.exit 1

}).call(this);
