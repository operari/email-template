import { src, dest, series, watch } from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import child_process from 'child_process';
import browserSync from 'browser-sync';
import nodeSass from 'node-sass';

const exec = child_process.exec;
const bs = browserSync.create();
const $ = gulpLoadPlugins();
const env = $.environment;

$.sass.compiler = nodeSass;

const SOURCES = {
  watch: {
    sass: './src/scss/*.scss',
    pug: './src/pug/*.pug'
  },
  src: {
    pug: './src/pug/index.pug',
    sass: './src/scss/*.scss',
    bs: '.',
    bsIndex: '/build/output/devOutput.html',
    prettyOut: './build/output/output.html'
  },
  dest: {
    pug: './build/output',
    sass: './build/css',
    prettyOut: './build/output'
  },
  rename: {
    pug: 'devOutput.html',
    prettyOut: 'prettyOutput.html'
  }
};

export function pug() {
  return src(SOURCES.src.pug)
    .pipe($.pug({
      pretty: true,
      data: {
        isDevelopment: env.is.development(),
        title: 'Development'
      }
    }))
    .pipe($.rename(SOURCES.rename.pug))
    .pipe(dest(SOURCES.dest.pug));
}

export function sass() {
  return src(SOURCES.src.sass)
    .pipe($.sass().on('error', $.sass.logError))
    .pipe(dest(SOURCES.dest.sass))
    .pipe(bs.stream());
}

export function obs(cb) {
  watch(SOURCES.watch.sass, sass).on('change', env.if.production(series(preview, prettyOutput)).else(function () {}));
  watch(SOURCES.watch.pug).on('change', env.if.development(series(pug, bs.reload)).else(series(preview, prettyOutput)));

  cb();
}

export function serve(cb) {
  bs.init({
    server: {
      baseDir: SOURCES.src.bs,
      index: SOURCES.src.bsIndex
    }
  });

  cb();
}

export function prettyOutput() {
  const headLink = '<link.+?>';
  const headStyles = '<style\\s+type(.|\\n)+<\\/style>';
  const topSubject = "<body>(.|\\n|\\r)+?_top'>";
  const botTexts = '"><\\/iframe>(.|\\n|\\r)+<\\/body>';
    
  return src(SOURCES.src.prettyOut)
    .pipe($.htmlEntities('decode'))
    .pipe($.removeContent({
      match: new RegExp('(' + headLink + ')|(' + headStyles + ')|(' + topSubject + ')|(' + botTexts + ')', 'gim')
    }))
    .pipe($.prettyHtml({
      indent_size: 2
    }))
    .pipe($.removeEmptyLines({
      removeComments: true
    }))
    .pipe($.rename(SOURCES.rename.prettyOut))
    .pipe(dest(SOURCES.dest.prettyOut));
}

export function preview(cb) {
  exec('node app.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
}

const build = series(sass, preview, prettyOutput);
const watcher = env.if.development(series(serve, sass, pug, obs)).else(series(obs, sass, preview));
const run = env.if.development(exports.watch).else(exports.build);

export { build, watcher as watch, run as default };