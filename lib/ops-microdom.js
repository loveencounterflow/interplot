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
    //---------------------------------------------------------------------------------------------------------
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

    //---------------------------------------------------------------------------------------------------------
    select(selector, fallback = misfit) {
      return this.select_from(document, selector, fallback);
    }

    select_all(selector) {
      return this.select_all_from(document, selector);
    }

    //---------------------------------------------------------------------------------------------------------
    select_from(element, selector, fallback = misfit) {
      var R;
      V.delement(element);
      V.nonempty_text(selector);
      if ((R = element.querySelector(selector)) == null) {
        if (fallback === misfit) {
          throw new Error(`^µDOM/select_from@7758^ no such element: ${µ.rpr(selector)}`);
        }
        return fallback;
      }
      return R;
    }

    //---------------------------------------------------------------------------------------------------------
    select_all_from(element, selector) {
      V.delement(element);
      V.nonempty_text(selector);
      return Array.from(element.querySelectorAll(selector));
    }

    //---------------------------------------------------------------------------------------------------------
    select_id(id, fallback = misfit) {
      var R;
      V.nonempty_text(id);
      if ((R = document.getElementById(id)) == null) {
        if (fallback === misfit) {
          throw new Error(`^µDOM/select_id@7758^ no element with ID: ${µ.rpr(id)}`);
        }
        return fallback;
      }
      return R;
    }

    //---------------------------------------------------------------------------------------------------------
    matches_selector(element, selector) {
      V.nonempty_text(selector);
      V.element(element);
      return element[name_of_match_method](selector);
    }

    //---------------------------------------------------------------------------------------------------------
    get(element, name) {
      V.element(element);
      return element.getAttribute(name);
    }

    set(element, name, value) {
      V.element(element);
      return element.setAttribute(name, value);
    }

    //---------------------------------------------------------------------------------------------------------
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

    //---------------------------------------------------------------------------------------------------------
    hide(element) {
      V.element(element);
      return element.style.display = 'none';
    }

    show(element) {
      V.element(element);
      return element.style.display = '';
    }

    //---------------------------------------------------------------------------------------------------------
    get_inner_html(element) {
      V.element(element);
      return element.innerHTML;
    }

    get_outer_html(element) {
      V.element(element);
      return element.outerHTML;
    }

    //---------------------------------------------------------------------------------------------------------
    get_live_styles(element) {
      return getComputedStyle(element);
    }

    /* validation done by method */    get_style_rule(element, name) {
      return (getComputedStyle(element))[name];
    }

    //=========================================================================================================
    // ELEMENT CREATION
    //---------------------------------------------------------------------------------------------------------
    parse_one(element_html) {
      var R, length;
      R = this.parse_all(element_html);
      if ((length = R.length) !== 1) {
        throw new Error(`^µDOM/parse_one@7558^ expected HTML for 1 element but got ${length}`);
      }
      return R[0];
    }

    //---------------------------------------------------------------------------------------------------------
    parse_all(html) {
      var R;
      /* TAINT return Array or HTMLCollection? */
      V.nonempty_text(html);
      R = document.implementation.createHTMLDocument();
      R.body.innerHTML = html;
      return R.body.children;
    }

    //---------------------------------------------------------------------------------------------------------
    new_element(xname, ...P) {
      /* TAINT analyze xname (a la `div#id42.foo.bar`) as done in Intertext.Cupofhtml */
      /* TAINT in some cases using innerHTML, documentFragment may be advantageous */
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

    //---------------------------------------------------------------------------------------------------------
    deep_copy(element) {
      return element.cloneNode(true);
    }

    //=========================================================================================================
    // INSERTION
    //---------------------------------------------------------------------------------------------------------
    insert(position, target, x) {
      switch (position) {
        case 'before':
        case 'beforebegin':
          return this.insert_before(target, x);
        case 'as_first':
        case 'afterbegin':
          return this.insert_as_first(target, x);
        case 'as_last':
        case 'beforeend':
          return this.insert_as_last(target, x);
        case 'after':
        case 'afterend':
          return this.insert_after(target, x);
      }
      throw new Error(`^µDOM/insert@7758^ not a valid position: ${µ.rpr(position)}`);
    }

    //---------------------------------------------------------------------------------------------------------
    /* NOTE pending practical considerations and benchmarks we will probably remove one of the two sets
     of insertion methods */
    insert_before(target, x) {
      V.element(target);
      return target.insertAdjacentElement('beforebegin', x);
    }

    insert_as_first(target, x) {
      V.element(target);
      return target.insertAdjacentElement('afterbegin', x);
    }

    insert_as_last(target, x) {
      V.element(target);
      return target.insertAdjacentElement('beforeend', x);
    }

    insert_after(target, x) {
      V.element(target);
      return target.insertAdjacentElement('afterend', x);
    }

    //---------------------------------------------------------------------------------------------------------
    before(target, ...x) {
      V.element(target);
      return target.before(...x);
    }

    prepend(target, ...x) {
      V.element(target);
      return target.prepend(...x);
    }

    append(target, ...x) {
      V.element(target);
      return target.append(...x);
    }

    after(target, ...x) {
      V.element(target);
      return target.after(...x);
    }

    //=========================================================================================================
    // GEOMETRY
    //---------------------------------------------------------------------------------------------------------
    /* NOTE observe that `DOM.get_offset_top()` and `element.offsetTop` are two different things; terminology
     is confusing here, so consider renaming to avoid `offset` altogether */
    get_offset_top(element) {
      return (this.get_offset(element)).top;
    }

    get_offset_left(element) {
      return (this.get_offset(element)).left;
    }

    //---------------------------------------------------------------------------------------------------------
    get_offset(element) {
      var rectangle;
      /* see http://youmightnotneedjquery.com/#offset */
      V.element(element);
      rectangle = element.getBoundingClientRect();
      return {
        top: rectangle.top + document.body.scrollTop,
        left: rectangle.left + document.body.scrollLeft
      };
    }

  };

  (globalThis.µ != null ? globalThis.µ : globalThis.µ = {}).DOM = new Micro_dom();

  /*

https://stackoverflow.com/a/117988/7568091

innerHTML is remarkably fast, and in many cases you will get the best results just setting that (I would
just use append).

However, if there is much already in "mydiv" then you are forcing the browser to parse and render all of
that content again (everything that was there before, plus all of your new content). You can avoid this by
appending a document fragment onto "mydiv" instead:

var frag = document.createDocumentFragment();
frag.innerHTML = html;
$("#mydiv").append(frag);
In this way, only your new content gets parsed (unavoidable) and the existing content does not.

EDIT: My bad... I've discovered that innerHTML isn't well supported on document fragments. You can use the
same technique with any node type. For your example, you could create the root table node and insert the
innerHTML into that:

var frag = document.createElement('table');
frag.innerHTML = tableInnerHtml;
$("#mydiv").append(frag);

*/

}).call(this);

//# sourceMappingURL=ops-microdom.js.map