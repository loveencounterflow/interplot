(function() {
  // cannot 'use strict'

  //###########################################################################################################
  var CND, FS, INTERTEXT, Mycupofhtml, Myspecials, Mytags, PATH, URL, alert, badge, debug, echo, get_sameid_tag, help, info, log, rpr, urge, warn, whisper,
    modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

  CND = require('cnd');

  rpr = CND.rpr.bind(CND);

  badge = 'INTERPLOT/TEMPLATES';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  // MKTS                      = require './main'
  PATH = require('path');

  FS = require('fs');

  URL = require('url');

  // CHR                       = require 'coffeenode-chr'
  //...........................................................................................................
  // _STYLUS                   = require 'stylus'
  // as_css                    = STYLUS.render.bind STYLUS
  // style_route               = PATH.join __dirname, '../src/mingkwai-typesetter.styl'
  // css                       = as_css FS.readFileSync style_route, encoding: 'utf-8'
  //...........................................................................................................
  /* NOTE starting migration to `Cupofhtml` b/c of `&quote` bug in teacup */
  INTERTEXT = require('intertext');

  //===========================================================================================================
  // EXPOSED METHODS (EXPERIMENTAL: FOR USE IN BROWSER CONTEXT)
  //-----------------------------------------------------------------------------------------------------------
  this.slug_as_html = function() {
    var c;
    c = new Mycupofhtml();
    c.S.slug();
    return c.as_html();
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  get_sameid_tag = function(name, blk) {
    return function(...P) {
      return this._.tag(name, {
        $blk: blk,
        id: name
      }, ...P);
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  Mytags = class Mytags extends INTERTEXT.CUPOFHTML.Tags {};

  Myspecials = (function() {
    //-----------------------------------------------------------------------------------------------------------
    class Myspecials extends INTERTEXT.CUPOFHTML.Specials {
      box(...P) {
        return this._.tag('box', {
          $blk: true
        }, ...P);
      }

      hbox(...P) {
        return this._.tag('hbox', {
          $blk: true
        }, ...P);
      }

      hgap(...P) {
        return this._.tag('hgap', {
          $blk: true
        }, ...P);
      }

      vbox(...P) {
        return this._.tag('vbox', {
          $blk: true
        }, ...P);
      }

      vgap(...P) {
        return this._.tag('vgap', {
          $blk: true
        }, ...P);
      }

      xhgap(...P) {
        return this._.tag('xhgap', {
          $blk: true
        }, ...P);
      }

      topmargin(...P) {
        return this._.tag('topmargin', {
          $blk: true
        }, ...P);
      }

      bottommargin(...P) {
        return this._.tag('bottommargin', {
          $blk: true
        }, ...P);
      }

      leftmargin(...P) {
        return this._.tag('leftmargin', {
          $blk: true
        }, ...P);
      }

      rightmargin(...P) {
        return this._.tag('rightmargin', {
          $blk: true
        }, ...P);
      }

      column(...P) {
        return this._.tag('column', {
          $blk: true
        }, ...P);
      }

      /* TAINT should be `<pageready></pageready>` if needed at all */
      artboard(...P) {
        return this._.tag('artboard', {
          $blk: true
        }, ...P);
      }

      trim() {
        return this._.tag('trim');
      }

      slug() {
        return this._.tag('slug', () => {
          return this.trim();
        });
      }

      pageready() {
        return this._.H.span({
          id: 'page-ready'
        });
      }

      //---------------------------------------------------------------------------------------------------------
      selector_generator() {
        /* https://github.com/fczbkk/css-selector-generator */
        var H, S;
        ({S, H} = this._);
        S.script('../fczbkk-css-selector-generator.js');
        return S.script(function() {
          return µ.DOM.ready(function() {
            var sg;
            sg = new CssSelectorGenerator();
            globalThis.selector_of = function(node) {
              return sg.getSelector(node);
            };
            return null;
          });
        });
      }

      //---------------------------------------------------------------------------------------------------------
      gauge() {
        var H, S;
        ({S, H} = this._);
        H.style(`gauge#gauge {
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
@media print{ gauge#gauge { display: none; } }\n`);
        S.script(function() {
          return µ.DOM.ready(function() {
            var f;
            //.....................................................................................................
            f = function() {
              var cmgauge_dom;
              cmgauge_dom = µ.DOM.select('#gauge');
              this.px_per_mm = (µ.DOM.get_width(cmgauge_dom)) / 10;
              this.mm_per_px = 1 / this.px_per_mm;
              this.px_from_mm = function(mm) {
                return mm * this.px_per_mm;
              };
              this.mm_from_px = function(px) {
                return px * this.mm_per_px;
              };
              this.width_mm_of = function(node) {
                return this.mm_from_px((_KW_as_dom_node(node)).getBoundingClientRect().width);
              };
              return this.height_mm_of = function(node) {
                return this.mm_from_px((_KW_as_dom_node(node)).getBoundingClientRect().height);
              };
            };
            //.....................................................................................................
            f.apply(globalThis.GAUGE = {});
            return null;
          });
        });
        return this._.tag('gauge', {
          id: 'gauge',
          class: 'gui draggable'
        });
      }

      //---------------------------------------------------------------------------------------------------------
      toolbox() {
        var H, S;
        ({S, H} = this._);
        S.script(function() {
          return µ.DOM.ready(function() {
            globalThis.toolbox = {};
            toolbox.debugonoff_dom = µ.DOM.select('#debugonoff');
            toolbox.zoomin_dom = µ.DOM.select('#zoomin');
            toolbox.zoomout_dom = µ.DOM.select('#zoomout');
            toolbox.zoomer_dom = µ.DOM.select('#zoomer');
            // zoomer_dom.css 'transform-origin', "top left"
            //...................................................................................................
            µ.DOM.on(toolbox.debugonoff_dom, 'click', function() {
              return µ.DOM.toggle_class(µ.DOM.select('body'), 'debug');
            });
            //...................................................................................................
            /* TAINT should use CSS animations */
            µ.DOM.on(toolbox.zoomin_dom, 'click', function() {
              var current_zoom;
              current_zoom = parseFloat(µ.DOM.get_style_rule(toolbox.zoomer_dom, 'zoom'));
              return µ.DOM.set_style_rule(toolbox.zoomer_dom, 'zoom', current_zoom * 1.25);
            });
            //...................................................................................................
            µ.DOM.on(toolbox.zoomout_dom, 'click', function() {
              var current_zoom;
              current_zoom = parseFloat(µ.DOM.get_style_rule(toolbox.zoomer_dom, 'zoom'));
              return µ.DOM.set_style_rule(toolbox.zoomer_dom, 'zoom', current_zoom / 1.25);
            });
            //...................................................................................................
            return null;
          });
        });
        return this._.tag('toolbox', {
          class: 'gui'
        }, function() {
          H.button({
            id: 'debugonoff',
            class: 'gui'
          }, "dbg");
          H.button({
            id: 'zoomout',
            class: 'gui'
          }, "z–");
          return H.button({
            id: 'zoomin',
            class: 'gui'
          }, "z+");
        });
      }

      //---------------------------------------------------------------------------------------------------------
      page(settings, content) {
        var clasz, defaults, id;
        defaults = {
          pagenr: 0
        };
        settings = {...defaults, ...settings};
        id = `page${settings.pagenr}`;
        clasz = (modulo(settings.pagenr, 2) === 0) ? 'left' : 'right';
        return this._.tag('page', {
          id,
          class: clasz
        }, () => {
          this._.tag('earmark', function() {
            return `${settings.pagenr}`;
          });
          this._.tag('paper');
          return this._.tag('chase', function() {
            if ((typeof content) === 'function') {
              return content();
            }
          });
        });
      }

      //---------------------------------------------------------------------------------------------------------
      galley() {
        return this.tag(function(settings) {
          return _._SLUGCONTAINER('galley', settings);
        });
      }

      //---------------------------------------------------------------------------------------------------------
      layout(settings, content) {
        var H, S;
        ({S, H} = this._);
        S.doctype('html');
        // H.html ->
        //   H.head ->
        H.meta({
          charset: 'utf8'
        });
        H.title(settings.title);
        S.script('../plink-plonk.js');
        S.script('../browserified.js');
        S.script('../ops-globals.js');
        S.script('../ops-microdom.js');
        S.script('../ops.js');
        S.link_css('../reset.css');
        S.link_css('../styles.css');
        S.script(function() {
          return µ.DOM.ready(function() {
            return console.log('^4445^', "demo for `µ.DOM.ready()`");
          });
        });
        return H.body((settings.body_def ? {
          class: settings.body_def
        } : {}), function() {
          content();
          return S.pageready();
        });
      }

    };

    Myspecials.prototype.tabletop = get_sameid_tag('tabletop');

    Myspecials.prototype.grid = get_sameid_tag('grid');

    Myspecials.prototype.zoomer = get_sameid_tag('zoomer', {
      $blk: true
    });

    Myspecials.prototype.caret = get_sameid_tag('caret');

    Myspecials.prototype.unstyledelement = get_sameid_tag('unstyledelement');

    return Myspecials;

  }).call(this);

  Mycupofhtml = (function() {
    //-----------------------------------------------------------------------------------------------------------
    class Mycupofhtml extends INTERTEXT.CUPOFHTML.Cupofhtml {};

    Mycupofhtml.prototype.H = Mytags;

    Mycupofhtml.prototype.S = Myspecials;

    return Mycupofhtml;

  }).call(this);

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.demo_galley = function() {
    var H, S, arity, c, settings;
    if ((arity = arguments.length) !== 0) {
      throw new Error(`^33211^ expected 0 arguments, got ${arity}`);
    }
    //.........................................................................................................
    c = new Mycupofhtml();
    ({H, S} = c.export());
    settings = {
      title: 'Galley Demo',
      body_def: 'debug'
    };
    S.layout(settings, function() {
      S.selector_generator();
      S.link_css('./galley.css');
      S.unstyledelement();
      S.gauge();
      S.toolbox();
      //.......................................................................................................
      return S.artboard({
        id: 'artboard1',
        class: 'pages'
      }, function() {
        S.caret();
/* TAINT ensure element doesn't take up space */        return S.zoomer(function() {
          // _style = "background-color:#ff0b;z-index:100;position:absolute;"
          H.div({
            class: 'draggable dropshadow'
          }, {
            style: "position:absolute;z-index:100;mix-blend-mode:multiply;backdrop-filter:blur(0.2mm);background-color:yellow;width:300mm;height:20mm;left:31mm;top:17mm"
          }, function() {
            return H.img({
              src: '../rulers/hruler.png',
              style: "mix-blend-mode:multiply;"
            });
          });
          H.div({
            class: 'draggable dropshadow'
          }, {
            style: "position:absolute;z-index:100;mix-blend-mode:multiply;backdrop-filter:blur(0.2mm);background-color:yellow;width:20mm;height:300mm;left:8mm;top:40mm"
          }, function() {
            return H.img({
              src: '../rulers/vruler.png',
              style: "mix-blend-mode:multiply;"
            });
          });
          S.script(function() {
            return µ.DOM.ready(function() {
              var element, i, len, ref, results;
              ref = µ.DOM.select_all('.draggable');
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                element = ref[i];
                results.push(µ.DOM.make_draggable(element));
              }
              return results;
            });
          });
          // # console.log '^33376^', "draggables deactivated FTTB"
          //     # ( $ '.draggable' ).draggable()
          //     # ( $ '.draggable' ).on 'focus', -> ( $ @ ).blur()
          // # _.TAG 'page', { pagenr: 0, }
          //.......................................................................................................
          return S.page({
            pagenr: 1
          }, function() {
            S.topmargin();
            S.hbox(function() {
              S.leftmargin();
              S.column();
              S.vgap();
              S.column();
              S.vgap();
              S.column();
              return S.rightmargin();
            });
            return S.bottommargin();
          });
        });
      });
    });
    // # #.......................................................................................................
    // # _.PAGE { pagenr: 3, }, ->
    // #   _.GALLEY    { width: '150mm', slugcount: 25,  empty: true, }
    // #.......................................................................................................
    // _.PAGE { pagenr: 4, }, ->
    //   _.TAG 'demo-paragraph', { id: 'd1', contenteditable: 'true', }, """
    //     自馮瀛王"""
    // #.......................................................................................................
    // _.PAGE { pagenr: 5, }, ->
    //   #.......................................................................................................
    //   _.TAG 'demo-paragraph', { id: 'd2', contenteditable: 'true', }, """
    //     ䷼䷽䷾䷿䷼䷽䷾䷿䷼䷽おきみつおきかずこううんじおきひでこうえいおきながカキクケオイロハニオヘトキュウカッパダッテ
    //     亥核帝六今令户戶京立音言主文一丁丂國七丄種从虫䜌聲한국어조선말ABC123縉鄑戬戩虚虛嘘噓墟任廷呈程草花
    //     敬寬茍苟慈没殁沒歿芟投般咎昝晷倃卧臥虎微秃丸常當尚尙區陋沿匚匡亡匸匿龍祗萬禽宫宮侣營麻術述刹新案
    //     條寨甚商罕深差茶採某也的害編真直值縣祖概鄉者良鬼龜過骨為爲益温溫穴空舟近雞食搵絕丟丢曾𠔃兮清前有
    //     半平內内羽非邦亠詽訮刊方兌兑马馬
    //     あいうえおか〇〡〢〣〤〥〦〧〨〩〸〹〺㐀㐁㐂一丁丂豈更車並况全𗀀𗀁𗀂𘠄𘠅𘠆𘠇𘠈𘠉𘠊𛅰𛅱𛅲𛅳
    //     ⾱⾲⾳⾴
    //     其法用膠泥刻字，薄如錢唇，每字為一印，火燒令堅。先設一鐵版，其上以松脂臘和紙灰之類冒之。
    //     其法用膠泥刻字、^薄如錢唇、^每字為一印、^火燒令堅。先設一鐵版、^其上以松脂臘和紙灰之類冒之。
    //     Yaffir rectangle刻文字apostolary. Letterpress printing is a technique of relief printing using a printing press.
    //     自馮瀛王始印五經已後典籍皆為版本其法用膠泥刻字
    //     """
    // #.......................................................................................................
    // _.PAGE { pagenr: 6, }, ->
    //   #.......................................................................................................
    //   _.TAG 'galley', { style: "max-width: 150mm", }, ->
    //     _.TAG 'slug', { style: "max-width: 150mm", }, ->
    //       ### thx to https://stackoverflow.com/a/30526943/7568091 ###
    //       _.TAG 'trim', { style: "display:flex;", contenteditable: 'true', }, ->
    //         _.RAW '自'
    //         _.TAG 'g'
    //         _.RAW '馮'
    //         _.TAG 'g'
    //         _.RAW '瀛'
    //         _.TAG 'g'
    //         _.RAW '王'
    //         # _.RAW '始'
    //         # _.RAW '印'
    //         # _.RAW '五'
    //         # _.RAW '經'
    //         # _.RAW '已'
    //         # _.RAW '後'
    //         # _.RAW '典'
    //         # _.RAW '籍'
    //         # _.RAW '皆'
    //         # _.RAW '為'
    //         # _.RAW '版'
    //         # _.RAW '本'
    //         # _.RAW '其'
    //         # _.RAW '法'
    //         # _.RAW '用'
    //         # _.RAW '膠'
    //         # _.RAW '泥'
    //         # _.RAW '刻'
    //         # _.RAW '字'
    // #.......................................................................................................
    // _.PAGE { pagenr: 7, }, ->
    //   #.......................................................................................................
    //   _.TAG 'demo-paragraph', { id: 'd3', contenteditable: 'true', }, -> for [ 0 .. 3 ] then _.RAW """
    //     <strong style='color:red;'>galley</strong> <em>(n.)</em> 13c., "sea&shy;going ves&shy;sel
    //     ha&shy;ving both sails and oars," from Old French ga&shy;lie, ga&shy;lee "boat, war&shy;ship,
    //     gal&shy;ley," from Medi&shy;eval Latin ga&shy;lea or Ca&shy;ta&shy;lan ga&shy;lea, from Late
    //     Greek ga&shy;lea, of un&shy;known ori&shy;gin. The <span style='font-size:300%'>word</span> has
    //     made its way into most Wes&shy;tern Eu&shy;ro&shy;pe&shy;an lan&shy;gua&shy;ges.
    //     Ori&shy;gi&shy;nal&shy;ly "low, flat-built sea&shy;going ves&shy;sel of one deck," once a
    //     com&shy;mon type in the Me&shy;di&shy;ter&shy;ra&shy;ne&shy;an. Mean&shy;ing "cook&shy;ing range
    //     or cook&shy;ing room on a ship" dates from 1750. The prin&shy;t&shy;ing sense of gal&shy;ley,
    //     "ob&shy;long tray that holds the type once set," is from 1650s, from French ga&shy;lée in the
    //     same sense, in re&shy;f&shy;er&shy;en&shy;ce to the shape of the tray. As a short form of
    //     galley-proof it is at&shy;tes&shy;ted from 1890. """
    // #.......................................................................................................
    // _.PAGE { pagenr: 8, }
    // _.PAGE { pagenr: 9, }
    // _.PAGE { pagenr: 10, }

    //.........................................................................................................
    return c.as_html();
  };

  //###########################################################################################################
  if (module === require.main) {
    (() => {
      var html;
      html = this.demo_galley();
      return echo(html);
    })();
  }

}).call(this);

//# sourceMappingURL=templates.js.map