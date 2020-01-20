(function() {
  //-----------------------------------------------------------------------------------------------------------
  this.demo_insert_html_fragment = function() {
    var content, context, stick, wrapped_content, zwnj, zwsp;
    log('^OPS/demo_insert_html_fragment@34341^', stick = $('stick'));
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
    xxx;
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
  this.demo_insert_slabs = function(slabs) {
    /* NOTE flag must always have a nominal height of 1mm */
    /* NOTE precision only applied for readability */
    /* TAINT should validate slabs */
    /* TAINT rewrite using DOM methods if faster */
    var R, chrs, delta_mm, delta_px, delta_rel, epsilon, first_chr, html, i, is_first_slab, is_last_slab, j, last_chr, left_flag_dom, left_flag_id, left_rect, len, line_nr, line_slab_count, line_text, line_too_long, margin, margin_left, margin_right, margins, prv_line_text, ref, ref1, ref2, ref3, ref4, ref5, rhs, right_flag_dom, right_flag_id, right_rect, slab, slab_count, slab_lnr, slab_lnr_start, slab_rnr, slug_count, slug_dom, slug_id, slug_jq, slug_width/* TAINT use sth like `rpr` */, start, stop, trim_dom, trim_id, trim_jq, txt, txt_dom;
    margins = {
      'Y': {
        left: '-2mm'
      },
      '-': {
        right: '-3mm'
      },
      '.': {
        right: '-3mm'
      }
    };
    //.........................................................................................................
    slab_count = slabs.$value.length;
    slug_count = Math.min(slab_count, 25);
    slab_lnr_start = null;
//.........................................................................................................
    for (line_nr = i = 1, ref = slug_count; (1 <= ref ? i <= ref : i >= ref); line_nr = 1 <= ref ? ++i : --i) {
      slab_lnr = 0;
      slab_rnr = -(line_nr + 1);
      //.......................................................................................................
      slug_id = `slug${line_nr}`;
      trim_id = `trim${line_nr}`;
      left_flag_id = `lflag${line_nr}`;
      right_flag_id = `rflag${line_nr}`;
      slug_dom = document.getElementById(slug_id);
      trim_dom = document.getElementById(trim_id);
      left_flag_dom = document.getElementById(left_flag_id);
      right_flag_dom = document.getElementById(right_flag_id);
      if (!((trim_dom != null) && (left_flag_dom != null) && (right_flag_dom != null))) {
        throw new Error(`^OPS@9872^ no such element #${trim_id}`);
      }
      slug_width = slug_dom.getBoundingClientRect().width;
      line_text = '';
      prv_line_text = null;
      line_slab_count = 0;
      ref1 = slabs.$value;
      //.......................................................................................................
      for (j = 0, len = ref1.length; j < len; j++) {
        slab = ref1[j];
        prv_line_text = line_text;
        slab_lnr++;
        slab_rnr++;
        line_slab_count++;
        if (slab_lnr_start == null) {
          slab_lnr_start = slab_lnr;
        }
        if (slab_rnr >= 0) {
          break;
        }
        //.....................................................................................................
        is_first_slab = slab_lnr === +1;
        is_last_slab = slab_rnr === -1;
        ({txt, rhs} = slab);
        if (rhs == null) {
          rhs = 'tight';
        }
        //.....................................................................................................
        if (rhs === 'shy') {
          if (is_last_slab) {
            txt += '-';
          }
        } else if (rhs === 'spc') {
          if (!is_last_slab) {
            txt += ' ';
          }
        }
        //.....................................................................................................
        /* Apply optical margin correction: */
        /* TAINT just a demo, must adjust to font, size, etc; also depends on user preferences */
        /* TAINT adjust width of `<trim/>` element */
        chrs = Array.from(txt);
        first_chr = chrs[0];
        last_chr = chrs[chrs.length - 1];
        if (is_first_slab && ((margin = (ref2 = margins[first_chr]) != null ? ref2.left : void 0) != null)) {
          trim_dom.style.marginLeft = margin;
        }
        if (is_last_slab && ((margin = (ref3 = margins[last_chr]) != null ? ref3.right : void 0) != null)) {
          trim_dom.style.marginRight = margin;
        }
        //.....................................................................................................
        txt_dom = document.createTextNode(txt);
        // trim_dom.appendChild txt_dom
        trim_dom.insertAdjacentText('beforeend', txt);
      }
      //.......................................................................................................
      /* NOTE join adjacent text nodes, remove empty ones */
      /* TAINT better to first join texts */
      trim_dom.normalize();
      line_text += txt;
      left_rect = left_flag_dom.getBoundingClientRect();
      right_rect = right_flag_dom.getBoundingClientRect();
      delta_px = right_rect.x - left_rect.x;
      delta_mm = get_approximate_ratio(delta_px, left_rect.height, 100);
      delta_rel = get_approximate_ratio(delta_px, slug_width, 100);
      // delta_pct     = ( get_approximate_ratio delta_px, slug_width,     100 ) * 100
      epsilon = 0.01;
      line_too_long = delta_rel > (1 + epsilon);
      if (!line_too_long) {
        /* TAINT must implement handling single line, last line */
        continue;
      }
      // log '^2298^', "delta: #{delta_mm} mm, #{delta_rel} rel, #{jr line_text}"
      if (line_slab_count >= 2) {
        line_nr--;
        slab_lnr--;
        slab_rnr--;
        line_slab_count--;
        line_text = prv_line_text;
        trim_dom.removeChild(trim_dom.firstChild);
      }
      slug_jq = $(`#slug${line_nr}`);
      trim_jq = slug_jq.find('trim');
      margin_left = (ref4 = trim_jq[0].style.marginLeft) != null ? ref4 : null;
      margin_right = (ref5 = trim_jq[0].style.marginRight) != null ? ref5 : null;
      start = slab_lnr_start - 1;
      stop = slab_lnr - 2;
      log('^33321^', jr(slabs));
      log('^33321^', jr([slabs.$value[start].txt, slabs.$value[stop].txt]));
      slug_jq.removeAttr('id');
      trim_jq.removeAttr('id contenteditable');
      (slug_jq.find('flag')).remove();
      html = slug_jq[0].outerHTML;
      R = {
        $key: '$slug',
        start,
        stop,
        html,
        text: line_text
      };
      if (margin_left != null) {
        R.margin_left = margin_left;
      }
      if (margin_right != null) {
        R.margin_right = margin_right;
      }
      return R;
    }
    return null;
  };

}).call(this);
