
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
  @_metrics_from_partial_slug = ( ctx, partial_slug ) ->
    slug_jq           = $ ctx.slug_template
    trim_jq           = slug_jq.find 'trim'
    column_dom        = ctx.columns_jq[ ctx.columns_idx ]
    column_width_mm   = GAUGE.width_mm_of column_dom
    # column_height_mm  = GAUGE.height_mm_of column_dom
    #.........................................................................................................
    trim_jq[ 0 ].insertAdjacentText 'beforeend', partial_slug.text
    column_dom.insertAdjacentElement 'beforeend', slug_jq[ 0 ]
    width_mm          = GAUGE.width_mm_of trim_jq
    overshoot_mm      = width_mm - column_width_mm
    spc_delta_mm      = if partial_slug.spc_count < 1 then null else -( overshoot_mm / partial_slug.spc_count )
    # slug_height_mm    = GAUGE.height_mm_of slug_jq
    # slug_top_mm       = GAUGE.mm_from_px slug_jq.offset().top
    # slug_bottom_mm    = slug_height_mm + slug_top_mm
    # log '^44342^', column_height_mm, slug_bottom_mm, slug_jq[ 0 ]
    ### NOTE here we use a boolean quality assessment; a more refined algorithm should use points for
    to differentiate between less and more desirable fittings based on delta space added to or subtracted
    from all space characters, presence or absence of hyphen and so on ###
    fitting_ok        = overshoot_mm <= ctx.epsilon_mm
    if ctx.live_demo
      await sleep 0
    # slug_jq.remove()
    return { slug_jq, width_mm, overshoot_mm, spc_delta_mm, fitting_ok, }

  #-----------------------------------------------------------------------------------------------------------
  @_slug_template = null
  @new_slug = ( nr ) ->
    unless ( template = @_slug_template )?
      template = @_slug_template = await TEMPLATES_slug nr

  #-----------------------------------------------------------------------------------------------------------
  @get_context = ->
    slug_template     = await TEMPLATES_slug()
    columns_jq        = ( $ 'page:first' ).find 'column'
    columns_idx       = 0
    epsilon_mm        = 0.2
    live_demo         = false
    return { slug_template, columns_jq, columns_idx, epsilon_mm, live_demo, }

  #-----------------------------------------------------------------------------------------------------------
  @slugs_with_metrics_from_slabs = ( slabs_dtm, settings ) ->
    ### TAINT how to use intertype in browser context? ###
    # validate.interplot_slabs_datom slabs_dtm
    ### TAINT use intertype for defaults ###
    defaults            = { min_slab_idx: 0, }
    settings            = { defaults..., settings..., }
    slabs               = slabs_dtm.$value
    { min_slab_idx, }   = settings
    last_slab_idx       = slabs.length - 1
    max_slab_idx        = min_slab_idx - 1
    prv_slug_metrics    = null
    slug_metrics        = null
    R                   = []
    #.........................................................................................................
    push_metrics = ( slug_metrics ) ->
      R.push slug_metrics
      slug_metrics.html = as_html slug_metrics.slug_jq
      if ctx.live_demo
        ctx.columns_jq[ ctx.columns_idx ].insertAdjacentElement 'beforeend', slug_metrics.slug_jq[ 0 ]
        await sleep 0.1
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


