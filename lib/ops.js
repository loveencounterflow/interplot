(function() {
  var provide_ops;

  provide_ops = function() {
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
    // #-----------------------------------------------------------------------------------------------------------
    // @_context_from_linenr = ( line_nr ) ->
    //   R                 = {}
    //   R.slug_id         = "slug#{line_nr}"
    //   R.trim_id         = "trim#{line_nr}"
    //   # R.left_flag_id    = "lflag#{line_nr}"
    //   # R.right_flag_id   = "rflag#{line_nr}"
    //   R.slug_dom        = document.getElementById R.slug_id
    //   R.trim_dom        = document.getElementById R.trim_id
    //   # R.lflag_dom       = document.getElementById R.left_flag_id
    //   # R.rflag_dom       = document.getElementById R.right_flag_id
    //   R.slug_rect       = as_plain_object R.slug_dom.getBoundingClientRect()
    //   R.trim_rect       = as_plain_object R.trim_dom.getBoundingClientRect()
    //   return R

    //-----------------------------------------------------------------------------------------------------------
    this._get_partial_slug = function(slabs, min_slab_idx, max_slab_idx) {
      /* TAINT also return text usable on next invocation so that part will not have to be computed again */
      var i, is_first_slab, is_last_slab, ref, ref1, rhs, slab, slab_idx, spc_count, text, txt;
      text = '';
      spc_count = 0;
      for (slab_idx = i = ref = min_slab_idx, ref1 = max_slab_idx; (ref <= ref1 ? i <= ref1 : i >= ref1); slab_idx = ref <= ref1 ? ++i : --i) {
        is_first_slab = slab_idx === min_slab_idx;
        is_last_slab = slab_idx === max_slab_idx;
        slab = slabs[slab_idx];
        ({txt, rhs} = slab);
        //.......................................................................................................
        switch (rhs != null ? rhs : null) {
          case null:
            null;
            break;
          //.....................................................................................................
          case 'shy':
            if (is_last_slab) {
              txt += '-';
            }
            break;
          //.....................................................................................................
          case 'spc':
            if (!is_last_slab) {
              spc_count++;
              txt += ' ';
            }
            break;
          default:
            //.....................................................................................................
            /* TAINT may wanrt to throw error or inform parent process */
            warn('^interplot/OPS/_get_partial_slug@8012', `ignoring slab.rhs ${jr(rhs)}`);
        }
        //.......................................................................................................
        text += txt;
      }
      //.........................................................................................................
      return {text, spc_count, min_slab_idx, max_slab_idx};
    };
    //-----------------------------------------------------------------------------------------------------------
    this._adapt_margins_to_hanging_punctuation = function(ctx, partial_slug) {};
    // ### Apply optical margin correction: ###
    /* a.k.a. margin kerning, optical margin alignment */
    /* see https://de.wikipedia.org/wiki/PdfTeX#Mikrotypographische_Erweiterungen */
    /* see https://en.wikipedia.org/wiki/Hanging_punctuation */
    /* see https://en.wikipedia.org/wiki/Optical_margin_alignment */
    /* Suggested Values for Optical Justification

      These values may be suitable for common seriffed fonts like Times New Roman, Palatino, or Garamond.
      Other fonts may need different values.

      Characters  Value
      " “ ” ' ‘ ’, .  100%
      hyphen  75%
      en-dash 50%
      em-dash 25%
      A T V W Y 20%
      C O 10%
    */
    // ### TAINT just a demo, must adjust to font, size, etc; also depends on user preferences ###
    // ### TAINT adjust width of `<trim/>` element ###
    // chrs          = Array.from txt
    // first_chr     = chrs[ 0 ]
    // last_chr      = chrs[ chrs.length - 1 ]
    // if is_first_slab and ( margin = margins[ first_chr ]?.left  )?
    //   trim_dom.style.marginLeft = margin
    // if is_last_slab  and ( margin = margins[ last_chr  ]?.right )?
    //   trim_dom.style.marginRight = margin

    //-----------------------------------------------------------------------------------------------------------
    this._metrics_from_partial_slug = async function(ctx, partial_slug) {
      var epsilon, free_width_mm, free_width_px, free_width_rel, line_too_long, precision, slug_jq, spc_width_mm, spc_width_px, text_width_mm, text_width_px, text_width_rel, trim_jq, width_mm;
      slug_jq = $((await TEMPLATES_slug()));
      trim_jq = slug_jq.find('trim');
      //.........................................................................................................
      trim_jq[0].insertAdjacentText('beforeend', partial_slug.text);
      ctx.composer_dom.insertAdjacentElement('beforeend', slug_jq[0]);
      width_mm = GAUGE.width_mm_of(trim_jq);
      log('^778774^', `${width_mm.toFixed(2)}mm`, as_html(slug_jq));
      return {slug_jq, width_mm};
      // log '^12321^', ctx.trim_id, GAUGE.width_mm_of ctx.trim_dom
      // lflag_rect      = ctx.lflag_dom.getBoundingClientRect()
      // rflag_rect      = ctx.rflag_dom.getBoundingClientRect()
      /* NOTE flag must always have a nominal height of 1mm */
      /* NOTE precision only applied for readability */
      precision = 100;
      epsilon = 1 / precision;
      return null; // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      //..........................................................................................................
      text_width_px = rflag_rect.x - lflag_rect.x;
      text_width_mm = get_approximate_ratio(text_width_px, lflag_rect.height, precision);
      text_width_rel = get_approximate_ratio(text_width_px, ctx.slug_rect.width, precision);
      //..........................................................................................................
      free_width_px = ctx.slug_rect.width - text_width_px;
      free_width_mm = get_approximate_ratio(free_width_px, lflag_rect.height, precision);
      free_width_rel = get_approximate_ratio(free_width_px, ctx.slug_rect.width, precision);
      //..........................................................................................................
      /* TAINT consider how to handle zero space lines */
      spc_width_px = free_width_px / partial_slug.spc_count;
      spc_width_mm = get_approximate_ratio(spc_width_px, lflag_rect.height, precision);
      //..........................................................................................................
      line_too_long = text_width_rel > (1 + epsilon);
      return {
        slug_id: ctx.slug_id,
        spc_count: partial_slug.spc_count,
        text_width_px,
        text_width_mm,
        text_width_rel,
        free_width_px,
        free_width_mm,
        free_width_rel,
        spc_width_px,
        spc_width_mm,
        line_too_long
      };
    };
    //-----------------------------------------------------------------------------------------------------------
    this._slug_template = null;
    this.new_slug = async function(nr) {
      var template;
      if ((template = this._slug_template) == null) {
        return template = this._slug_template = (await TEMPLATES_slug(nr));
      }
    };
    //-----------------------------------------------------------------------------------------------------------
    return this.slug_from_slabs = function(slab_dtm, settings) {
      /* TAINT use intertype for defaults */
      var ctx, defaults, last_slab_idx, max_slab_idx, metrics_queue, min_slab_idx, partial_slug, slabs, slug_metrics;
      defaults = {
        min_slab_idx: 0
      };
      settings = {...defaults, ...settings};
      slabs = slab_dtm.$value;
      ({min_slab_idx} = settings);
      last_slab_idx = slabs.length - 1;
      max_slab_idx = min_slab_idx - 1;
      metrics_queue = [];
      ctx = {
        composer_dom: ($('composer:first')).get(0),
        galley_dom: ($('galley:first')).get(0),
        composer_slugcount: ($('composer:first')).data('slugcount'),
        galley_slugcount: ($('galley:first')).data('slugcount')
      };
      while (true) {
        max_slab_idx++;
        if (max_slab_idx > last_slab_idx) {
          break;
        }
        partial_slug = this._get_partial_slug(slabs, min_slab_idx, max_slab_idx);
        /* TAINT re-use out of two alternating slug templates; cache DOM nodes */
        // ctx               = @_context_from_linenr line_nr
        slug_metrics = this._metrics_from_partial_slug(ctx, partial_slug);
        log('^3389^', jr(slug_metrics));
        metrics_queue.push(slug_metrics);
        if (metrics_queue.length > ctx.galley_slugcount) {
          (metrics_queue.shift()).slug_jq.remove();
        }
      }
      return null;
    };
  };

  //###########################################################################################################
  provide_ops.apply(globalThis.OPS = {});

}).call(this);
