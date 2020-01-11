
#-----------------------------------------------------------------------------------------------------------
after = ( dts, f ) -> setTimeout f, dts * 1000
log   = console.log

#-----------------------------------------------------------------------------------------------------------
demo_d3 = ->
  # set the dimensions and margins of the graph
  margin  = { top: 20, right: 30, bottom: 40, left: 90, }
  width   = 460 - margin.left - margin.right
  height  = 400 - margin.top - margin.bottom

  # append the svg object to the body of the page
  svg = d3.select '#chart'
    .append 'svg'
      .attr 'width', width + margin.left + margin.right
      .attr 'height', height + margin.top + margin.bottom
    .append 'g'
      .attr 'transform', "translate( #{margin.left}, #{margin.top}  )"

  path = 'file:///home/flow/io/interplot/public/7_OneCatOneNum_header.csv'
  d3.csv path, ( data ) ->
    window.x = d3.scaleLinear()
      .domain   [ 0, 13000, ]
      .range    [ 0, width, ]

    # Add X axis
    svg.append 'g'
      .attr 'transform', "translate( 0, #{height} )"
      .call d3.axisBottom x
      .selectAll 'text'
      .attr 'transform', "translate(-10,0)rotate(-45)"
      .style 'text-anchor', 'end'

    # Y axis
    y = d3.scaleBand()
      .range [ 0, height, ]
      .domain data.map ( d ) -> d.Country
      .padding 0.1

    svg.append 'g'
      .call d3.axisLeft y

    #Bars
    svg.selectAll 'myRect'
      .data data
      .enter()
      .append 'rect'
      .attr 'x',      x 0
      .attr 'y',      ( d ) -> y d.Country
      .attr 'width',  ( d ) -> x d.Value
      .attr 'height', y.bandwidth()
      .attr 'fill',   '#69b333'
  return null

#-----------------------------------------------------------------------------------------------------------
demo_plotly_1 = ->
  #.........................................................................................................
  trace_1 =
    name:         'trace_1'
    x:            [ 0, 1, 2, 3, 4, 5, ]
    y:            [ 20, 1, 2, 4, 8, 16, ]
    mode:         'lines+markers'
    line:
      shape:  'spline'
  trace_2 =
    name:         'trace_2'
    x:            [ 0, 1, 2, 3, 4, 5, ]
    y:            [ 20, 1, 2, 4, 8, 16, ]
    type:         'bar'
    orientation:  'h'
  trace_3 =
    name:         'trace_3'
    x:            [ 0, 1, 2, 3, 4, 5, ]
    y:            [ 20, 1, 2, 4, 8, 16, ]
    type:         'bar'
    orientation:  'v'
  #.........................................................................................................
  data    = [ trace_1, trace_3, trace_2, ]
  #.........................................................................................................
  layout  =
    title:        "Just A Line"
    showlegend:   true
    #.......................................................................................................
    # margin:
    #   t:          10
    #.......................................................................................................
    font:
      size:       20
      family:     'Lobster'
  #.........................................................................................................
  config =
    displayModeBar:   true
    staticPlot:       false
    scrollZoom:       true
    showLink:         true
    responsive:       true
    toImageButtonOptions:
      format:           'png'
      filename:         'custom_image',
      height:           1200,
      width:            1200,
      scale:            2
  #.........................................................................................................
  plot data, layout, config
  return null

#-----------------------------------------------------------------------------------------------------------
plot = ( data, layout = null, config = null ) ->
  t0 = Date.now(); log 'µ3332-1', "before plot #{t0}"
  Plotly.plot 'chart', data, layout, config
  t1 = Date.now(); log 'µ3332-2', "after plot #{t1}"
  log 'µ3332-3', "plotting took #{( t1 - t0 ) / 1000}s"
  signal_plot_ready()

#-----------------------------------------------------------------------------------------------------------
signal_plot_ready = -> ( jQuery 'body' ).append ( jQuery "<div id=chart_ready></" )

#-----------------------------------------------------------------------------------------------------------
demo_plotly_ternary = ->
  #.........................................................................................................
  make_axis = ( title, tickangle ) ->
    R =
      title:        title
      titlefont:    { size: 20, }
      tickangle:    tickangle
      tickfont:     { size: 15, }
      tickcolor:    'rgba(0,0,0,0)'
      ticklen:      5
      showline:     true
      showgrid:     true
  #.........................................................................................................
  rawData = [
      { journalist: 75, developer: 25,  designer: 0,  label: 'point 1',   }
      { journalist: 70, developer: 10,  designer: 20, label: 'point 2',   }
      { journalist: 75, developer: 20,  designer: 5,  label: 'point 3',   }
      { journalist: 5,  developer: 60,  designer: 35, label: 'point 4',   }
      { journalist: 10, developer: 80,  designer: 10, label: 'point 5',   }
      { journalist: 10, developer: 90,  designer: 0,  label: 'point 6',   }
      { journalist: 20, developer: 70,  designer: 10, label: 'point 7',   }
      { journalist: 10, developer: 20,  designer: 70, label: 'point 8',   }
      { journalist: 15, developer: 5,   designer: 80, label: 'point 9',   }
      { journalist: 10, developer: 10,  designer: 80, label: 'point 10',  }
      { journalist: 20, developer: 10,  designer: 70, label: 'point 11',  }
      { journalist: 50, developer: 50,  designer: 50, label: 'center',  }
      { journalist: 50, developer: 50,  designer: 0, label: 'jourdev',  }
      { journalist: 50, developer: 50,  designer: 10, label: 'jourdevdes10',  }
      { journalist: 100, developer: 0,  designer: 0, label: 'only-journalist',  }
      { journalist: 0, developer: 100,  designer: 0, label: 'only-developer',  }
      { journalist: 0, developer: 0,  designer: 100, label: 'only-designer',  }
    ]
  #.........................................................................................................
  trace_1 =
    type:   'scatterternary',
    mode:   'markers+lines',
    a:      rawData.map ( d ) -> d.journalist
    b:      rawData.map ( d ) -> d.developer
    c:      rawData.map ( d ) -> d.designer
    text:   rawData.map ( d ) -> d.label
    marker:
      symbol: 100,
      color: '#DB7365',
      size: 14,
      line: { width: 2 }
  #.........................................................................................................
  data = [ trace_1, ]
  #.........................................................................................................
  layout =
    showlegend:   true
    ternary:
        sum: 100
        aaxis: make_axis "Journalist",    0
        baxis: make_axis "\nDeveloper", +45
        caxis: make_axis "\nDesigner",  -45
        bgcolor: '#fff1e0'
    annotations: [{
      showarrow:  false
      text:       "Replica of Tom Pearson's block"
      x:          1.0
      y:          1.3
      font:       { size: 15 }
      }]
    paper_bgcolor: '#fff1e0'
  #.........................................................................................................
  config =
    displayModeBar:   true
    staticPlot:       false
    scrollZoom:       true
    showLink:         true
    responsive:       true
    toImageButtonOptions:
      format:           'png'
      filename:         'custom_image',
      height:           1200,
      width:            1200,
      scale:            2
  #.........................................................................................................
  plot data, layout, config
  return null

#-----------------------------------------------------------------------------------------------------------
demo_ranges_and_coordinates = ->
  log = console.log;
  log document.querySelector 'p'
  # d = document.getSelection();
  # d = window.getSelection();
  # d.empty();
  # d.addRange( range );
  first_p = document.querySelector 'p'
  log 'bounding box', first_p.getClientRects()
  range = document.createRange()
  range.selectNode first_p
  log range
  newNode = document.createElement 'p'
  newNode.appendChild document.createTextNode "New Node Inserted Here"
  range.insertNode newNode

############################################################################################################
# demo_d3()
# demo_taucharts()
# demo_plotly_1()
# demo_plotly_ternary()
demo_ranges_and_coordinates()

