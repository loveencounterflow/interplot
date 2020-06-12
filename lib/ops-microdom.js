(function() {
  'use strict';
  var Micro_dom, V, _types, isa, misfit, name_of_match_method;

  misfit = Symbol('misfit');

  _types = µ.TYPES.export();

  V = _types.validate;

  ({isa} = _types);

  //===========================================================================================================
  name_of_match_method = (function() {
    var element, i, len, name, ref;
    element = document.createElement('div');
    ref = ['matches', 'matchesSelector', 'msMatchesSelector', 'mozMatchesSelector', 'webkitMatchesSelector', 'oMatchesSelector'];
    for (i = 0, len = ref.length; i < len; i++) {
      name = ref[i];
      if (element[name] != null) {
        return name;
      }
    }
  })();

  //===========================================================================================================
  µ.TYPES.declare('element', function(x) {
    return x instanceof Element;
  });

  µ.TYPES.declare('delement', function(x) {
    return x === document || x instanceof Element;
  });

  //===========================================================================================================
  Micro_dom = class Micro_dom { // extends Multimix
    /* inspired by http://youmightnotneedjquery.com
     and https://blog.garstasio.com/you-dont-need-jquery */
    //-----------------------------------------------------------------------------------------------------------
    ready(f) {
      // thx to https://stackoverflow.com/a/7053197/7568091
      // function r(f){/in/.test(document.readyState)?setTimeout(r,9,f):f()}
      V.function(f);
      if (/in/.test(document.readyState)) {
        return setTimeout((() => {
          return this.ready(f);
        }), 9);
      }
      return f();
    }

    //-----------------------------------------------------------------------------------------------------------
    select(selector, fallback = misfit) {
      return this.select_from(document, selector, fallback);
    }

    select_all(selector) {
      return this.select_all_from(document, selector);
    }

    //-----------------------------------------------------------------------------------------------------------
    select_from(element, selector, fallback = misfit) {
      var R;
      V.delement(element);
      V.nonempty_text(selector);
      R = element.querySelector(selector);
      if (R == null) {
        if (fallback === misfit) {
          throw new Error(`^µDOM/select@7758^ no such element: ${µ.rpr(selector)}`);
        }
        return fallback;
      }
      return R;
    }

    //-----------------------------------------------------------------------------------------------------------
    select_all_from(element, selector) {
      V.delement(element);
      V.nonempty_text(selector);
      return Array.from(element.querySelectorAll(selector));
    }

    //-----------------------------------------------------------------------------------------------------------
    select_id(id) {
      V.nonempty_text(id);
      return document.getElementById(id);
    }

    //-----------------------------------------------------------------------------------------------------------
    matches_selector(element, selector) {
      V.nonempty_text(selector);
      V.element(element);
      return element[name_of_match_method](selector);
    }

    //-----------------------------------------------------------------------------------------------------------
    get(element, name) {
      V.element(element);
      return element.getAttribute(name);
    }

    set(element, name, value) {
      V.element(element);
      return element.setAttribute(name, value);
    }

    //-----------------------------------------------------------------------------------------------------------
    get_classes(element) {
      V.element(element);
      return element.classList;
    }

    add_class(element, name) {
      V.element(element);
      return element.classList.add(name);
    }

    has_class(element, name) {
      V.element(element);
      return element.classList.contains(name);
    }

    remove_class(element, name) {
      V.element(element);
      return element.classList.remove(name);
    }

    toggle_class(element, name) {
      V.element(element);
      return element.classList.toggle(name);
    }

    //-----------------------------------------------------------------------------------------------------------
    hide(element) {
      V.element(element);
      return element.style.display = 'none';
    }

    show(element) {
      V.element(element);
      return element.style.display = '';
    }

    //-----------------------------------------------------------------------------------------------------------
    get_inner_html(element) {
      V.element(element);
      return element.innerHTML;
    }

    get_outer_html(element) {
      V.element(element);
      return element.outerHTML;
    }

    //-----------------------------------------------------------------------------------------------------------
    get_live_styles(element) {
      return getComputedStyle(element);
    }

    /* validation done by method */    get_style_rule(element, name) {
      return (getComputedStyle(element))[name];
    }

    //-----------------------------------------------------------------------------------------------------------
    parse_html(html) {
      var R;
      R = document.implementation.createHTMLDocument();
      R.body.innerHTML = html;
      return R.body.children;
    }

    //-----------------------------------------------------------------------------------------------------------
    new_element(xname, ...P) {
      /* TAINT analyze xname (a la `div#id42.foo.bar`) as done in Intertext.Cupofhtml */
      var R, attributes, i, k, len, p, text, v;
      R = document.createElement(xname);
      attributes = {};
      text = null;
      for (i = 0, len = P.length; i < len; i++) {
        p = P[i];
        if (isa.text(p)) {
          text = p;
          continue;
        }
        attributes = Object.assign(attributes, p);
      }
      if (text != null) {
        /* TAINT check type? */        R.textContent = text;
      }
      for (k in attributes) {
        v = attributes[k];
        R.setAttribute(k, v);
      }
      return R;
    }

  };

  (globalThis.µ != null ? globalThis.µ : globalThis.µ = {}).DOM = new Micro_dom();

  /*

https://stackoverflow.com/a/117988/7568091

innerHTML is remarkably fast, and in many cases you will get the best results just setting that (I would just use append).

However, if there is much already in "mydiv" then you are forcing the browser to parse and render all of that content again (everything that was there before, plus all of your new content). You can avoid this by appending a document fragment onto "mydiv" instead:

var frag = document.createDocumentFragment();
frag.innerHTML = html;
$("#mydiv").append(frag);
In this way, only your new content gets parsed (unavoidable) and the existing content does not.

EDIT: My bad... I've discovered that innerHTML isn't well supported on document fragments. You can use the same technique with any node type. For your example, you could create the root table node and insert the innerHTML into that:

var frag = document.createElement('table');
frag.innerHTML = tableInnerHtml;
$("#mydiv").append(frag);

*/

}).call(this);

//# sourceMappingURL=ops-microdom.js.map