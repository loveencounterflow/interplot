(function() {
  var provide_ops;

  provide_ops = function() {
    //-----------------------------------------------------------------------------------------------------------
    this.demo_ranges_and_coordinates = function() {
      var d, element, i, len, log, rectangle, results, selector, selectors;
      log = console.log;
      log(document.querySelector('p'));
      // d = document.getSelection();
      // d = window.getSelection();
      // d.empty();
      // d.addRange( range );
      selectors = 'div p'.split(/\s+/);
      results = [];
      for (i = 0, len = selectors.length; i < len; i++) {
        selector = selectors[i];
        results.push((function() {
          var j, len1, ref, results1;
          ref = $(selector);
          results1 = [];
          for (j = 0, len1 = ref.length; j < len1; j++) {
            element = ref[j];
            results1.push((function() {
              var ref1, results2;
              ref1 = element.getClientRects();
              // log Object::toString.call element
              // first_p = document.querySelector 'p'
              // log 'bounding box', first_p.getClientRects()
              results2 = [];
              for (d of ref1) {
                // Rectangle attributes: x, y, width, height, top, right, bottom, left, toJSON()
                // log '^37365^', "Rectangle ( #{d.x}, #{d.y} ) .. ( #{d.right}, #{d.bottom} )"
                rectangle = $("<div class='dbg domrectangle'></div>");
                rectangle.offset(d);
                rectangle.width(d.width);
                rectangle.height(d.height);
                results2.push(($('body')).append(rectangle));
              }
              return results2;
            })());
          }
          return results1;
        })());
      }
      return results;
    };
    // range = document.createRange()
    // range.selectNode first_p
    // log range
    // newNode = document.createElement 'p'
    // newNode.appendChild document.createTextNode "New Node Inserted Here"
    // range.insertNode newNode

    //-----------------------------------------------------------------------------------------------------------
    this.demo_jquery_test = function() {
      var element;
      // log '^77763^', 'demo_jquery_test'
      element = $('stick#xe761');
      log('^33987^', element);
      // info '^33987^', element
      // element.text "change to something"
      return ($('*')).length;
    };
    //-----------------------------------------------------------------------------------------------------------
    this.demo_wait_for_dom_ready = function() {
      /*
      thx to https://stackoverflow.com/a/48514876/7568091

      The observer event handler will trigger whenever any node is added or removed from the document. Inside
      the handler, we then perform a contains check to determine if myElement is now in the document.

      You don't need to iterate over each MutationRecord stored in mutations because you can perform the
      document.contains check directly upon myElement.

      To improve performance, replace document with the specific element that will contain myElement in the DOM.

      */
      /*
      var myElement = $("<div>hello world</div>")[0];

      var observer = new MutationObserver(function(mutations) {
         if (document.contains(myElement)) {
              console.log("It's in the DOM!");
              observer.disconnect();
          }
      });

      observer.observe(document, {attributes: false, childList: true, characterData: false, subtree:true});

      $("body").append(myElement); // console.log: It's in the DOM!
      */
      return null;
    };
    //-----------------------------------------------------------------------------------------------------------
    this.demo_find_end_of_line = function() {
      return null;
    };
    //-----------------------------------------------------------------------------------------------------------
    this.xxx = function() {};
    /*
    selection:
      anchorNode, anchorOffset, focusNode, focusOffset, isCollapsed, rangeCount, type, baseNode, baseOffset,
      extentNode, extentOffset, getRangeAt, addRange, removeRange, removeAllRanges, empty, collapse,
      setPosition, collapseToStart, collapseToEnd, extend, setBaseAndExtent, selectAllChildren,
      deleteFromDocument, containsNode, modify
    range:
      startContainer, startOffset, endContainer, endOffset, collapsed, commonAncestorContainer, setStart,
      setEnd, setStartBefore, setStartAfter, setEndBefore, setEndAfter, collapse, selectNode,
      selectNodeContents, compareBoundaryPoints, deleteContents, extractContents, cloneContents, insertNode,
      surroundContents, cloneRange, detach, isPointInRange, comparePoint, intersectsNode, getClientRects,
      getBoundingClientRect, createContextualFragment, expand
    */
    //-----------------------------------------------------------------------------------------------------------
    this.rectangle_from_selection = function(selection = null) {
      var bottom, height, left, range, right, text, top, width, x, y;
      if (selection == null) {
        selection = window.getSelection();
      }
      range = selection.getRangeAt(0);
      text = selection.anchorNode.wholeText;
      log('^3334^', selection.anchorNode.parentNode.id, selection.anchorOffset, jr(text.slice(0, selection.anchorOffset)));
      // log '^33452^', selection.anchorNode.nodeType
      // log '^33452^', ( k for k of selection.anchorNode ); xxx
      // log '^3334^', selection.focusNode.parentNode.id, selection.focusOffset
      // log '^3334^', selection.baseNode.parentNode.id, selection.baseOffset
      /* TAINT use method to convert to JSON-compatible value */
      ({x, y, width, height, top, right, bottom, left} = range.getBoundingClientRect());
      return {x, y, width, height, top, right, bottom, left};
    };
    //-----------------------------------------------------------------------------------------------------------
    this.demo_insert_html_fragment = function() {
      /* NOTE

      Here we parse and insert an HTML fragment. We have to represent the *context* of the fragment—that is, the
      sequence of open HTML tags at that point—so the browser can know what CSS rules to apply to the line. We
      wrap the line into a generic `<div>` tag which will cause both jQuery (I guess) and the browser to close
      all open tags at the end of the line. Without that tag, the last open `<em>` and its text would be missing
      from the page (I guess jQuery does that, but not sure).

      Observe that with this technique, we do *not* have to reproduce syntactically complete HTML fragments but
      can let the browser do that for us; this appears to work with both inline and block tags such as `<p>`.
      Keep in mind that some disparities as compared to regular rendering of a whole page may occur since some
      CSS rules such as `text-align-last` do apply in this situation that would not apply had the line be
      typeset in the middle of a paragraph. */
      var content, context, stick, wrapped_content, zwnj, zwsp;
      log('^OPS/demo_insert_html_fragment@34341^', stick = $('stick'));
      context = "<p>";
      context = context + "<spleft/>";
      zwsp = String.fromCodePoint(0x200b);
      zwnj = String.fromCodePoint(0x200c);
      // content         = context + "This<f/> is<f/> a<f/> <em>first<f/> bit<f/></em> of<f/> text.<f/> It<f/> is<f/> <strong>not<f/></strong> a<f/> <em>very<f/> long<f/> one.<f/>"
      // content         = context + "This is a <em>first f#{zwnj}irst bit</em> of text. Yaffir stood high. (1) Yaf&shy;f&shy;ir (2) Yaf#{zwnj}f#{zwnj}ir. It is <strong>not</strong> a <em>very long one."
      // content         = context + "This is a <em>first f#{zwnj}irst bit</em> of text. <i>Yaffir stood high."
      // content         = context + "This<sp/>is<sp/>a<sp/><em>first<sp/>f#{zwnj}irst<sp/>bit</em><sp/>of<sp/>text.<sp/><i>Yaffir<sp/>stood<sp/>high."
      // content         = context + "This<sp/>is<sp/>a<sp/>text.<sp/><i>Yaffir<sp/>stood<sp/>high."
      content = context + "<ng style='margin-left:-6Q;'>This</ng><ng>guy</ng><ng>called</ng><ng><em>Yaffir</em>,</ng><ng>he</ng><ng><strong>stood</strong></ng><ng><strong>high</strong>.</ng><ng>Hyphen-</ng><ng>able</ng>";
      // content         = context + "<txt id=nr1>This is a </txt><em><txt id=nr2>first bit</txt></em><txt id=nr3> of text & a test. It is </txt><strong><txt id=nr4>not</txt></strong><txt id=nr5> a </txt><em><txt id=nr6>very long one.</txt>"
      wrapped_content = `<div><span id=innerwrap>${content}</span><flag/></div>`;
      // content         = context + "<a href='http://example.com'>This<flag/> is a <em>first bit</em> of text. It is <strong>not</strong> a <em>very long one.</a>"
      stick.append($(wrapped_content));
      return `inserted ${content}`;
    };
    //-----------------------------------------------------------------------------------------------------------
    return this.demo_insert_slabs = function(slabs) {
      var i, len, ref, ref1, rhs, slab, slab_dom, target_dom, target_id, txt_dom;
      /* TAINT should validate slabs */
      //.........................................................................................................
      target_id = 'xe761';
      target_dom = document.getElementById(target_id);
      if (target_dom == null) {
        throw new Error(`^OPS@9872^ no such element #${target_id}`);
      }
//.........................................................................................................
/* TAINT use sth like `rpr` */      ref = slabs.$value;
      for (i = 0, len = ref.length; i < len; i++) {
        slab = ref[i];
        // log '^55545^', slab.rhs, slab.txt
        rhs = (ref1 = slab.rhs) != null ? ref1 : 'tight';
        slab_dom = document.createElement('slab');
        if (rhs === 'shy') {
          slab.txt += '-';
        } else if (rhs === 'spc') {
          slab.txt += ' ';
        }
        txt_dom = document.createTextNode(slab.txt);
        slab_dom.appendChild(txt_dom);
        target_dom.insertAdjacentElement('beforeend', slab_dom);
        //.......................................................................................................
        switch (rhs) {
          case 'shy':
            null;
            break;
          case 'spc':
            null;
            break;
          case 'tight':
            null;
            break;
          default:
            throw new Error(`^OPS@9871^ unknown value for slab.rhs: ${rhs}`);
        }
      }
/* TAINT use sth like `rpr` */      return null;
    };
  };

  //###########################################################################################################
  provide_ops.apply(globalThis.OPS = {});

  // demo_d3()
  // demo_taucharts()
  // demo_plotly_1()
  // demo_plotly_ternary()
  if (running_in_browser()) {
    (() => {
      return ($(document)).ready(() => {
        /* thx to https://stackoverflow.com/a/987376/7568091 */
        var element, galley, id, range, selection;
        log("^333498^ document ready");
        OPS.demo_insert_html_fragment();
        // after 5, ->
        log("focusing anchor");
        ($('a')).focus();
        id = 'xe761';
        element = document.getElementById(id);
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
        //.......................................................................................................
        log('^343376^ element   ', element);
        log('^343376^ selection ', selection);
        log('^343376^ range     ', range);
        globalThis.element = element;
        globalThis.selection = selection;
        globalThis.range = range;
        //.......................................................................................................
        galley = $('galley');
        return galley.prepend($("<p>123</p>"));
      });
    })();
  }

  // ( $ 'a' ).trigger { type: 'keypress', which: 13, keyCode: 13, }
  log('^557576^', "running_in_browser:", this.running_in_browser());

  // log '^557576^', ( k for k of globalThis )

}).call(this);
