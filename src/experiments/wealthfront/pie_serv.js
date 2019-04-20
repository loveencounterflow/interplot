var http = require('http'),
    url = require('url'),
    jsdom = require('jsdom'),
    child_proc = require('child_process'),
    w = 400,
    h = 400,
    scripts = ["file://"+__dirname+"/d3.js",
               "file://"+__dirname+"/d3.layout.js",
               "file://"+__dirname+"/pie.js"],
    htmlStub = '<!DOCTYPE html><div id="pie" style="width:'+w+'px;height:'+h+'px;"></div>';

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'image/png'});
  var convert = child_proc.spawn("convert", ["svg:", "png:-"]),
      values = (url.parse(req.url, true).query['values'] || ".5,.5")
        .split(",")
        .map(function(v){return parseFloat(v)});

  convert.stdout.on('data', function (data) {
    res.write(data);
  });
  convert.on('exit', function(code) {
    res.end();
  });

  jsdom.env({features:{QuerySelector:true}, html:htmlStub, scripts:scripts, done:function(errors, window) {
    var svgsrc = window.insertPie("#pie", w, h, values).innerHTML;
    //jsdom's domToHTML will lowercase element names
    svgsrc = svgsrc.replace(/radialgradient/g,'radialGradient');
    convert.stdin.write(svgsrc);
    convert.stdin.end();
  }});
}).listen(8888, "127.0.0.1");

console.log('Pie SVG server running at http://127.0.0.1:8888/');
console.log('ex. http://127.0.0.1:8888/?values=.4,.3,.2,.1');