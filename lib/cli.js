(function() {
  'use strict';
  var CND, FS, PATH, alert, assign, badge, cast, debug, defaults, echo, help, info, isa, jr, log, rpr, type_of, types, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'INTERPLOT/CLI';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  FS = require('fs');

  PATH = require('path');

  ({assign, jr} = CND);

  // { walk_cids_in_cid_range
  //   cwd_abspath
  //   cwd_relpath
  //   here_abspath
  //   _drop_extension
  //   project_abspath }       = require './helpers'
  types = require('./types');

  ({isa, validate, cast, defaults, type_of} = types);

  //...........................................................................................................
  // require                   './exception-handler'

  //-----------------------------------------------------------------------------------------------------------
  this.cli = function() {
    return new Promise((done) => {
      var TEMPLATES, app, has_command;
      TEMPLATES = require('./templates');
      app = require('commander');
      has_command = false;
      //.........................................................................................................
      app.name('InterPlot').version((require('../package.json')).version);
      // #.........................................................................................................
      // app
      //   .name     FONTMIRROR.CFG.name
      //   .version  FONTMIRROR.CFG.version
      // #.........................................................................................................
      // app
      //   .command 'cfg'
      //   .description "show current configuration values"
      //   .action ( source_path, d ) =>
      //     has_command = true
      //     FONTMIRROR.CFG.show_cfg()
      //     done()
      //.........................................................................................................
      app.command('write-template <template_name> <target_path> [parameters...]').description("Write a template to HTML").action((template_name, target_path, parameters, d) => {
        var html, name;
        has_command = true;
        if (!isa.interplot_template_name(template_name)) {
          warn(`not a valid template name: ${rpr(template_name)}`);
          help("valid template names include");
          help(((function() {
            var results;
            results = [];
            for (name in TEMPLATES) {
              results.push(rpr(name));
            }
            return results;
          })()).join(', '));
          process.exit(1);
        }
        html = TEMPLATES[template_name](...parameters);
        if (target_path === '--') {
          echo(html);
        } else {
          FS.writeFileSync(target_path, html);
          help(`output written to ${target_path}`);
        }
        return done();
      });
      //.........................................................................................................
      app.parse(process.argv);
      if (!has_command) {
        app.outputHelp(function(message) {
          return CND.orange(message);
        });
      }
      // debug '^33376^', ( k for k of app).sort().join ', '
      return null;
    });
  };

  //###########################################################################################################
  if (module === require.main) {
    (async() => {
      return (await this.cli());
    })();
  }

}).call(this);