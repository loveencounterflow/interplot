
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
  svg = d3.select '#my_dataviz'
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
      .attr 'fill', '#69b333'
  return null

############################################################################################################
demo_d3()


