(function() {
  'use strict';
  var Micro_dom, V, _types, isa, misfit, name_of_match_method;

  misfit = Symbol('misfit');

  _types = µ.TYPES.export();

  V = _types.validate;

  ({isa} = _types);

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
  Micro_dom = class Micro_dom { // extends Multimix
    /* inspired by http://youmightnotneedjquery.com/ */
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
      V.nonempty_text(selector);
      V.domelement(element);
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
      V.nonempty_text(selector);
      V.domelement(element);
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
      V.domelement(element);
      return element[name_of_match_method](selector);
    }

    //-----------------------------------------------------------------------------------------------------------
    get(element, name) {
      V.domelement(element);
      return element.getAttribute(name);
    }

    set(element, name, value) {
      V.domelement(element);
      return element.setAttribute(name, value);
    }

    //-----------------------------------------------------------------------------------------------------------
    get_classes(element) {
      V.domelement(element);
      return element.classList;
    }

    add_class(element, name) {
      V.domelement(element);
      return element.classList.add(name);
    }

    has_class(element, name) {
      V.domelement(element);
      return element.classList.contains(name);
    }

    remove_class(element, name) {
      V.domelement(element);
      return element.classList.remove(name);
    }

    toggle_class(element, name) {
      V.domelement(element);
      return element.classList.toggle(name);
    }

    //-----------------------------------------------------------------------------------------------------------
    hide(element) {
      V.domelement(element);
      return element.style.display = 'none';
    }

    show(element) {
      V.domelement(element);
      return element.style.display = '';
    }

    //-----------------------------------------------------------------------------------------------------------
    get_inner_html(element) {
      V.domelement(element);
      return element.innerHTML;
    }

    get_outer_html(element) {
      V.domelement(element);
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

}).call(this);

//# sourceMappingURL=ops-microdom.js.map