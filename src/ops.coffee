
provide_ops = ->

  #-----------------------------------------------------------------------------------------------------------
  @demo_wait_for_dom_ready = ->
    ###
    thx to https://stackoverflow.com/a/48514876/7568091

    The observer event handler will trigger whenever any node is added or removed from the document. Inside
    the handler, we then perform a contains check to determine if myElement is now in the document.

    You don't need to iterate over each MutationRecord stored in mutations because you can perform the
    document.contains check directly upon myElement.

    To improve performance, replace document with the specific element that will contain myElement in the DOM.

    ###
    ###
    var myElement = $("<div>hello world</div>")[0];

    var observer = new MutationObserver(function(mutations) {
       if (document.contains(myElement)) {
            console.log("It's in the DOM!");
            observer.disconnect();
        }
    });

    observer.observe(document, {attributes: false, childList: true, characterData: false, subtree:true});

    $("body").append(myElement); // console.log: It's in the DOM!
    ###
    return null

  # #-----------------------------------------------------------------------------------------------------------
  # @_context_from_linenr = ( line_nr ) ->
  #   R                 = {}
  #   R.slug_id         = "slug#{line_nr}"
  #   R.trim_id         = "trim#{line_nr}"
  #   # R.left_flag_id    = "lflag#{line_nr}"
  #   # R.right_flag_id   = "rflag#{line_nr}"
  #   R.slug_dom        = document.getElementById R.slug_id
  #   R.trim_dom        = document.getElementById R.trim_id
  #   # R.lflag_dom       = document.getElementById R.left_flag_id
  #   # R.rflag_dom       = document.getElementById R.right_flag_id
  #   R.slug_rect       = as_plain_object R.slug_dom.getBoundingClientRect()
  #   R.trim_rect       = as_plain_object R.trim_dom.getBoundingClientRect()
  #   return R

  #-----------------------------------------------------------------------------------------------------------
  @_get_partial_slug = ( slabs, min_slab_idx, max_slab_idx ) ->
    ### TAINT also return text usable on next invocation so that part will not have to be computed again ###
    text      = ''
    spc_count = 0
    for slab_idx in [ min_slab_idx .. max_slab_idx ]
      is_first_slab = slab_idx is min_slab_idx
      is_last_slab  = slab_idx is max_slab_idx
      slab          = slabs[ slab_idx ]
      { txt, rhs, } = slab
      #.......................................................................................................
      switch rhs ? null
        when null then null
        #.....................................................................................................
        when 'shy'
          if is_last_slab
            txt += '-'
        #.....................................................................................................
        when 'spc'
          unless is_last_slab
            spc_count++
            txt += ' '
        #.....................................................................................................
        ### TAINT may wanrt to throw error or inform parent process ###
        else warn '^interplot/OPS/_get_partial_slug@8012', "ignoring slab.rhs #{jr rhs}"
      #.......................................................................................................
      text += txt
    #.........................................................................................................
    return { text, spc_count, min_slab_idx, max_slab_idx, }

  #-----------------------------------------------------------------------------------------------------------
  @_adapt_margins_to_hanging_punctuation = ( ctx, partial_slug ) ->
    # ### Apply optical margin correction: ###
    ### a.k.a. margin kerning, optical margin alignment ###
    ### see https://de.wikipedia.org/wiki/PdfTeX#Mikrotypographische_Erweiterungen ###
    ### see https://en.wikipedia.org/wiki/Hanging_punctuation ###
    ### see https://en.wikipedia.org/wiki/Optical_margin_alignment ###
    ### "Suggested Values for Optical Justification" (https://en.wikipedia.org/wiki/Optical_margin_alignment)

      These values may be suitable for common seriffed fonts like Times New Roman, Palatino, or Garamond.
      Other fonts may need different values.

      Characters  Value
      " “ ” ' ‘ ’, .  100%
      hyphen  75%
      en-dash 50%
      em-dash 25%
      A T V W Y 20%
      C O 10%
    ###
    # ### TAINT just a demo, must adjust to font, size, etc; also depends on user preferences ###
    # ### TAINT adjust width of `<trim/>` element ###
    # chrs          = Array.from txt
    # first_chr     = chrs[ 0 ]
    # last_chr      = chrs[ chrs.length - 1 ]
    # if is_first_slab and ( margin = margins[ first_chr ]?.left  )?
    #   trim_dom.style.marginLeft = margin
    # if is_last_slab  and ( margin = margins[ last_chr  ]?.right )?
    #   trim_dom.style.marginRight = margin

  #-----------------------------------------------------------------------------------------------------------
  @XXX_show_caret_style = ( ctx ) ->
    css = ctx.caret_style
    # log '^3334-1^', [ ( css.getPropertyValue 'font-family' ), ( css.getPropertyValue 'font-size' ), ( css.getPropertyValue 'font-style' ), ]
    # log '^3334-2^', [ ( css[ 'font-family' ] ), ( css[ 'font-size' ] ), ( css[ 'font-style' ] ), ]
    log '^3334-3^', ( css[ k ] for k in µ.TMP._css_font_properties ).join '/'
    return null

  #-----------------------------------------------------------------------------------------------------------
  @_metrics_from_partial_slug = ( ctx, partial_slug ) ->
    slug_jq           = $ ctx.slug_template
    trim_jq           = slug_jq.find 'trim'
    ctx.prv_dom_id++
    slug_jq.attr  'id', "slug#{ctx.prv_dom_id}"
    trim_jq.attr  'id', "trim#{ctx.prv_dom_id}"
    column_dom        = ctx.columns_dom[ ctx.columns_idx ]
    # column_height_mm  = GAUGE.height_mm_of column_dom
    #.........................................................................................................
    trim_jq[ 0 ].insertAdjacentText 'afterbegin', partial_slug.text
    trim_jq[ 0 ].insertAdjacentElement 'beforeend', ctx.caret_dom
    column_dom.insertAdjacentElement 'beforeend', slug_jq[ 0 ]
    @XXX_show_caret_style ctx
    width_mm          = GAUGE.width_mm_of trim_jq
    overshoot_mm      = width_mm - ctx.column_width_mm
    spc_delta_mm      = if partial_slug.spc_count < 1 then null else -( overshoot_mm / partial_slug.spc_count )
    # slug_height_mm    = GAUGE.height_mm_of slug_jq
    # slug_top_mm       = GAUGE.mm_from_px slug_jq.offset().top
    # slug_bottom_mm    = slug_height_mm + slug_top_mm
    # log '^44342^', column_height_mm, slug_bottom_mm, slug_jq[ 0 ]
    ### NOTE here we use a boolean quality assessment; a more refined algorithm should use points for
    to differentiate between less and more desirable fittings based on delta space added to or subtracted
    from all space characters, presence or absence of hyphen and so on ###
    fitting_ok        = overshoot_mm <= ctx.epsilon_mm
    await sleep 0 if ctx.live_demo
    slug_jq.remove()
    return { slug_jq, width_mm, overshoot_mm, spc_delta_mm, fitting_ok, }

  #-----------------------------------------------------------------------------------------------------------
  @get_pointer_metrics = ( ctx ) ->
    top_mm      = GAUGE.mm_from_px µ.DOM.get_offset_top ctx.reglet_dom
    advance_mm  = top_mm - ctx.column_top
    remain_mm   = ctx.column_height_mm - advance_mm
    return { advance_mm, remain_mm, }

  #-----------------------------------------------------------------------------------------------------------
  @get_context = ->
    ### NOTE intermediate solution; later on, the pointer should be set by some higher level method to
    indicate where upcoming material should be directed to; setting up columns will then consisting of
    locating the `pointer#pointer` element, then retrieving its parent element (the first column to
    consider) and the columns that either follow it according to a special 'text flow' attribute or (the
    default) in document order. ###
    log '^ops/get_context@66855-1^'
    R                   = {}
    R.slug_template     = await TEMPLATES_slug() ### use single composer !!!!!!!!!!!!!!!!!!!!!!!!!!! ###
    page_dom            = µ.DOM.select 'page'
    R.columns_dom       = µ.DOM.select_all_from page_dom, 'column'
    R.columns_idx       = 0
    column_dom          = R.columns_dom[ R.columns_idx ]
    R.column_top        = GAUGE.mm_from_px    µ.DOM.get_offset_top column_dom
    R.column_width_mm   = GAUGE.width_mm_of   column_dom
    R.column_height_mm  = GAUGE.height_mm_of  column_dom
    ### TAINT in some cases using innerHTML, documentFragment may be advantageous ###
    ### TAINT do not use literal name, ID; refer to templates ###
    R.reglet_dom        = µ.DOM.new_element 'pointer', { id: 'pointer', }
    # µ.DOM.insert_as_last column_dom, R.reglet_dom
    µ.DOM.append column_dom, R.reglet_dom
    R.epsilon_mm        = 0.2
    R.prv_dom_id        = 0
    R.caret_dom         = µ.DOM.select '#caret'
    R.caret_style       = getComputedStyle R.caret_dom
    #.........................................................................................................
    R.XXX_insert_big_words = true
    R.XXX_insert_big_words = false
    R.live_demo         = false
    return R
    ###
    document.createElement('p')
    d = document.createElement('p')
    d.setAttribute('style',"width:10px;height:10px;border:2px solid red;")
    ref = document.getElementById('r1-1')
    ref.insertAdjacentElement('beforebegin',d)
    document.getElementById('r1-2').insertAdjacentElement('beforebegin',d)
    ###

  #-----------------------------------------------------------------------------------------------------------
  @slugs_with_metrics_from_slabs = ( slabs_dtm, settings ) ->
    ### TAINT how to use intertype in browser context? ###
    # validate.interplot_slabs_datom slabs_dtm
    ### TAINT use intertype for defaults ###
    log '^ops/slugs_with_metrics_from_slabs@4455-1^'
    defaults            = { min_slab_idx: 0, }
    settings            = { defaults..., settings..., }
    slabs               = slabs_dtm.$value
    { min_slab_idx, }   = settings
    last_slab_idx       = slabs.length - 1
    max_slab_idx        = min_slab_idx - 1
    prv_slug_metrics    = null
    slug_metrics        = null
    line_nr             = 0
    R                   = []
    #.........................................................................................................
    push_metrics = ( slug_metrics ) =>
      line_nr++
      R.push slug_metrics
      slug_metrics.html = as_html slug_metrics.slug_jq
      ### !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ###
      if ctx.XXX_insert_big_words and ( parts = slug_metrics.slug_jq.text().split /(raised)/ ).length is 3 ### !!!! ###
        # slug_metrics.slug_jq.html "#{parts[ 0 ]}<span style='font-size:300%'>g#{parts[ 1 ]}y</span>#{parts[ 2 ]}"
        ### NOTE `<trim/>` needed for proper baseline-alignment ###
        slug_metrics.slug_jq.html "<trim>#{parts[ 0 ]}<span style='font-size:300%'>g#{parts[ 1 ]}y</span>#{parts[ 2 ]}</trim>"
      ### !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ###
      µ.DOM.before ctx.reglet_dom, slug_metrics.slug_jq[ 0 ]
      reglet_metrics    = @get_pointer_metrics ctx
      log '^33442^', line_nr, "#{reglet_metrics.advance_mm.toFixed 1} mm / #{reglet_metrics.remain_mm.toFixed 1} mm" # , slug_metrics.slug_jq[ 0 ]
      await sleep 0 if ctx.live_demo
      delete slug_metrics.slug_jq
      return null
    #.........................................................................................................
    ctx           = await @get_context()
    ctx.live_demo = false
    ctx.live_demo = true
    #.........................................................................................................
    loop
      max_slab_idx++
      ### TAINT add prv_slug_metrics to R where missing ###
      if max_slab_idx > last_slab_idx
        ### flush ###
        if prv_slug_metrics?
          push_metrics prv_slug_metrics
          prv_slug_metrics  = null
        break
      partial_slug  = @_get_partial_slug slabs, min_slab_idx, max_slab_idx
      slug_metrics  = await @_metrics_from_partial_slug ctx, partial_slug
      #.......................................................................................................
      unless slug_metrics.fitting_ok
        ### flush ###
        if prv_slug_metrics?
          min_slab_idx = max_slab_idx # - 1
          push_metrics prv_slug_metrics
          prv_slug_metrics  = null
          continue
        min_slab_idx = max_slab_idx + 1
        push_metrics slug_metrics
        continue
      #.......................................................................................................
      prv_slug_metrics = slug_metrics
    #.........................................................................................................
    return R


############################################################################################################
provide_ops.apply globalThis.OPS = {}


