(function() {
  'use strict';
  var CND, FS, PATH, alert, badge, debug, echo, example, help, info, rpr, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'INTERPLOT/SCRATCH';

  debug = CND.get_logger('debug', badge);

  alert = CND.get_logger('alert', badge);

  whisper = CND.get_logger('whisper', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  info = CND.get_logger('info', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  FS = require('fs');

  PATH = require('path');

  warn(CND.reverse("Can't use harfbuzzjs because:"));

  warn(CND.reverse("* harfbuzzjs doesn't have font feature switches (python version has them)"));

  warn(CND.reverse("* metrics returned with font glyph nr, but have no way so far to access these for typesetting"));

  process.exit(1);

  //-----------------------------------------------------------------------------------------------------------
  example = function(HB, font_blob, text) {
    /* from https://pypi.org/project/uharfbuzz/:
         features = {"kern": True, "liga": True}
         hb.shape(font, buf, features)
       */
    var R/* TAINT !!! features are not supported yet !!! */, blob, buffer, face, font;
    blob = HB.createBlob(font_blob);
    face = HB.createFace(blob, 0);
    font = HB.createFont(face);
    /* NOTE Units per em. Optional; taken from font if not given */
    font.setScale(1000, 1000);
    buffer = HB.createBuffer();
    try {
      buffer.addText(text);
      buffer.guessSegmentProperties();
      /* NOTE optional as can be set by guessSegmentProperties also: */
      // buffer.setDirection 'ltr'
      HB.shape(font, buffer);
      R = buffer.json(font);
    } finally {
      // console.log '^555787^', font
      // console.log '^555787^', face
      buffer.destroy();
      font.destroy();
      face.destroy();
      blob.destroy();
    }
    return R;
  };

  //###########################################################################################################
  if (module === require.main) {
    (async() => {
      var HB, d, font_blob, i, len, path, ref, results, text;
      path = '/home/flow/jzr/ucdb/font-sources/lmroman10-italic.otf';
      path = '/home/flow/jzr/ucdb/font-sources/lmroman10-italic.otf';
      font_blob = new Uint8Array(FS.readFileSync(path));
      HB = (await require('harfbuzzjs'));
      text = 'Just Text.';
      ref = example(HB, font_blob, text);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        d = ref[i];
        results.push(urge(d));
      }
      return results;
    })();
  }

}).call(this);

//# sourceMappingURL=harfbuzzjs-fontmetrics.js.map