
provide_ops = ->
  #-----------------------------------------------------------------------------------------------------------
  @demo_ranges_and_coordinates = ->
    log = console.log;
    log document.querySelector 'p'
    # d = document.getSelection();
    # d = window.getSelection();
    # d.empty();
    # d.addRange( range );
    selectors = 'div p'.split /\s+/
    for selector in selectors
      for element in $ selector
        # log Object::toString.call element
    # first_p = document.querySelector 'p'
    # log 'bounding box', first_p.getClientRects()
        for d from element.getClientRects()
          # Rectangle attributes: x, y, width, height, top, right, bottom, left, toJSON()
          # log '^37365^', "Rectangle ( #{d.x}, #{d.y} ) .. ( #{d.right}, #{d.bottom} )"
          rectangle = $ "<div class='dbg domrectangle'></div>"
          rectangle.offset d
          rectangle.width  d.width
          rectangle.height d.height
          ( $ 'body' ).append rectangle
    # range = document.createRange()
    # range.selectNode first_p
    # log range
    # newNode = document.createElement 'p'
    # newNode.appendChild document.createTextNode "New Node Inserted Here"
    # range.insertNode newNode

  #-----------------------------------------------------------------------------------------------------------
  @demo_jquery_test = ->
    # log '^77763^', 'demo_jquery_test'
    element = $ 'stick#xe761'
    log '^33987^', element
    # info '^33987^', element
    # element.text "change to something"
    return ( $ '*' ).length

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
  @demo_find_end_of_line = ->
    return null

  #-----------------------------------------------------------------------------------------------------------
  @rectangle_from_selection = ->
    selection = window.getSelection()
    range     = selection.getRangeAt 0
    ### TAINT use method to convert to JSON-compatible value ###
    { x
      y
      width
      height
      top
      right
      bottom
      left  } = range.getBoundingClientRect()
    return { x, y, width, height, top, right, bottom, left, }

  #-----------------------------------------------------------------------------------------------------------
  @demo_insert_html_fragment = ->
    log '^OPS/demo_insert_html_fragment@34341^', stick = $ 'stick'
    ### NOTE

    Here we parse and insert an HTML fragment. We have to represent the *context* of the fragment—that is, the
    sequence of open HTML tags at that point—so the browser can know what CSS rules to apply to the line. We
    wrap the line into a generic `<div>` tag which will cause both jQuery (I guess) and the browser to close
    all open tags at the end of the line. Without that tag, the last open `<em>` and its text would be missing
    from the page (I guess jQuery does that, but not sure).

    Observe that with this technique, we do *not* have to reproduce syntactically complete HTML fragments but
    can let the browser do that for us; this appears to work with both inline and block tags such as `<p>`.
    Keep in mind that some disparities as compared to regular rendering of a whole page may occur since some
    CSS rules such as `text-align-last` do apply in this situation that would not apply had the line be
    typeset in the middle of a paragraph. ###
    context         = "<p>"
    content         = context + "<a href='http://example.com'>This<flag/> is a <em>first bit</em> of text. It is <strong>not</strong> a <em>very long one.</a>"
    wrapped_content = "<div>#{content}</div>"
    stick.append $ wrapped_content
    return "inserted #{content}"


############################################################################################################
provide_ops.apply globalThis.OPS = {}


# demo_d3()
# demo_taucharts()
# demo_plotly_1()
# demo_plotly_ternary()
if running_in_browser() then do =>
  ( $ document ).ready =>
    log "^333498^ document ready"
    OPS.demo_insert_html_fragment()
    # after 5, ->
    log "focusing anchor"
    ( $ 'a' ).focus()
    ### thx to https://stackoverflow.com/a/987376/7568091 ###
    id        = 'xe761'
    element   = document.getElementById id
    selection = window.getSelection()
    range     = document.createRange()
    range.selectNodeContents element
    selection.removeAllRanges()
    selection.addRange range
    #.......................................................................................................
    log '^343376^ element   ', element
    log '^343376^ selection ', selection
    log '^343376^ range     ', range
    globalThis.element   = element
    globalThis.selection = selection
    globalThis.range     = range
    #.......................................................................................................
    galley = $ 'galley'
    galley.prepend $ "<p>123</p>"
    # ( $ 'a' ).trigger { type: 'keypress', which: 13, keyCode: 13, }
log '^557576^', "running_in_browser:", @running_in_browser()
# log '^557576^', ( k for k of globalThis )


