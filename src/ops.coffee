
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

  #-----------------------------------------------------------------------------------------------------------
  @_context_from_linenr = ( line_nr ) ->
    R                 = {}
    R.slug_id         = "slug#{line_nr}"
    R.trim_id         = "trim#{line_nr}"
    # R.left_flag_id    = "lflag#{line_nr}"
    # R.right_flag_id   = "rflag#{line_nr}"
    R.slug_dom        = document.getElementById R.slug_id
    R.trim_dom        = document.getElementById R.trim_id
    # R.lflag_dom       = document.getElementById R.left_flag_id
    # R.rflag_dom       = document.getElementById R.right_flag_id
    R.slug_rect       = as_plain_object R.slug_dom.getBoundingClientRect()
    R.trim_rect       = as_plain_object R.trim_dom.getBoundingClientRect()
    return R

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
  @_metrics_from_partial_slug = ( ctx, partial_slug ) ->
    # ### TAINT may keep left margin from previous call ###
    # ### Apply optical margin correction: ###
    # ### TAINT just a demo, must adjust to font, size, etc; also depends on user preferences ###
    # ### TAINT adjust width of `<trim/>` element ###
    # chrs          = Array.from txt
    # first_chr     = chrs[ 0 ]
    # last_chr      = chrs[ chrs.length - 1 ]
    # if is_first_slab and ( margin = margins[ first_chr ]?.left  )?
    #   trim_dom.style.marginLeft = margin
    # if is_last_slab  and ( margin = margins[ last_chr  ]?.right )?
    #   trim_dom.style.marginRight = margin
    #.........................................................................................................
    # txt_dom     = document.createTextNode txt
    # trim_dom.appendChild txt_dom
    ctx.trim_dom.insertAdjacentText 'beforeend', partial_slug.text
    log '^12321^', ctx.trim_id, GAUGE.width_mm_of ctx.trim_dom
    # lflag_rect      = ctx.lflag_dom.getBoundingClientRect()
    # rflag_rect      = ctx.rflag_dom.getBoundingClientRect()
    ### NOTE flag must always have a nominal height of 1mm ###
    ### NOTE precision only applied for readability ###
    precision       = 100
    epsilon         = 1 / precision
    return null # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    #..........................................................................................................
    text_width_px   = rflag_rect.x - lflag_rect.x
    text_width_mm   = get_approximate_ratio text_width_px, lflag_rect.height,     precision
    text_width_rel  = get_approximate_ratio text_width_px, ctx.slug_rect.width,   precision
    #..........................................................................................................
    free_width_px   = ctx.slug_rect.width - text_width_px
    free_width_mm   = get_approximate_ratio free_width_px, lflag_rect.height,     precision
    free_width_rel  = get_approximate_ratio free_width_px, ctx.slug_rect.width,   precision
    #..........................................................................................................
    ### TAINT consider how to handle zero space lines ###
    spc_width_px    = free_width_px / partial_slug.spc_count
    spc_width_mm    = get_approximate_ratio spc_width_px,  lflag_rect.height,     precision
    #..........................................................................................................
    line_too_long   = text_width_rel > ( 1 + epsilon )
    return {
      slug_id:        ctx.slug_id,
      spc_count:      partial_slug.spc_count,
      text_width_px,
      text_width_mm,
      text_width_rel,
      free_width_px,
      free_width_mm,
      free_width_rel,
      spc_width_px,
      spc_width_mm,
      line_too_long, }

  #-----------------------------------------------------------------------------------------------------------
  @slug_from_slabs = ( slab_dtm, settings ) ->
    ### TAINT use intertype for defaults ###
    defaults            = { min_slab_idx: 0, }
    settings            = { defaults..., settings..., }
    slabs               = slab_dtm.$value
    { min_slab_idx, }   = settings
    last_slab_idx       = slabs.length - 1
    max_slab_idx        = min_slab_idx - 1
    line_nr             = 0 ### TAINT use alternating slugs ###
    loop
      max_slab_idx++
      break if max_slab_idx > last_slab_idx
      partial_slug      = @_get_partial_slug slabs, min_slab_idx, max_slab_idx
      ### TAINT re-use out of two alternating slug templates; cache DOM nodes ###
      line_nr++
      ctx               = @_context_from_linenr line_nr
      slug_metrics      = @_metrics_from_partial_slug ctx, partial_slug
      # log '^3389^', jr slug_metrics
      # log '^3389^', jr partial_slug
      # log '^3887^', jr ctx
    return null


############################################################################################################
provide_ops.apply globalThis.OPS = {}


