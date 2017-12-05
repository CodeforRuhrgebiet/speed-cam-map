/*
    IMPORTS
*/
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import cssnano from 'gulp-cssnano';
import autoprefixer from 'gulp-autoprefixer';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
import babel from 'gulp-babel';
import htmlmin from 'gulp-htmlmin';
import imagemin from 'gulp-imagemin';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import jshint from 'gulp-jshint';
import rename from 'gulp-rename';

import mozjpeg from 'imagemin-mozjpeg';
import jpegtran from 'imagemin-jpegtran';
import pngquant from 'imagemin-pngquant';

import browserSync from 'browser-sync';
import del from 'del';


/*
    CONFIG
*/
const paths = {
  geojson: {
    src: 'src/geojson',
    dest: './dist/geojson'
  },
  styles: {
    src: 'src/sass',
    dest: './dist/styles/'
  },
  scripts: {
    src: 'src/js',
    dest: './dist/scripts/'
  },
  html: {
    src: 'src/html',
    dest: './dist/'
  },
  images: {
    src: 'src/img',
    dest: './dist/images/'
  }
};

const config = {
  // see browserlist: http://browserl.ist/?q=last+4+versions%2C+not+ie+%3C%3D+10%2C+not+Edge+%3C%3D+13%2C+Safari+%3E%3D+8
  browsers: ['last 4 versions', 'not ie <= 10', 'not Edge <= 13', 'Safari >= 8'],
}
config.babel = {
  "presets": [
    [
      "env",
      {
        "targets": {
          "browsers": config.browsers
        }
      }
    ]
  ]
}


/*
    CONS & HELPERS
*/
const _gulpsrc = gulp.src;
gulp.src = function() {
  return _gulpsrc.apply(gulp, arguments)
    .pipe(plumber({
      errorHandler: function(err) {
        notify.onError({
          title:    "Gulp Error",
          message:  "Error: <%= error.message %>",
          sound:    "Bottle"
        })(err);
        this.emit('end');
      }
    }));
};

// Browser Sync
const server = browserSync.create();

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({
    server: {
      baseDir: './'
    }
  });
  done();
}


/*
    BUILD
*/
// Styles
export function style_main() {
  return gulp.src(`${paths.styles.src}/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer({
        browsers: config.browsers,
        cascade: false
    }))
    .pipe(cssnano())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.styles.dest));
}

const styles = gulp.series(
  style_main,
);
export { styles };


// Javascript
export function deleteScripts(done) {
  del([`${paths.scripts.dest}**/*`, `!${paths.scripts.dest}**/unicorn.js`]).then((paths) => {
    console.log('Deleted files and folders:\n', paths.join('\n'));
    done();
  });
}

export function scripts_main() {
  return gulp.src([
      `${paths.scripts.src}/modules/*.js`,
      `${paths.scripts.src}/base/*.js`
    ], { sourcemaps: true })
    .pipe(sourcemaps.init())
    .pipe(babel(config.babel))
    .pipe(uglify({
        compress: {
            drop_console: true
        }
    }))
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.scripts.dest));
}

export function scripts_main_dev() {
  return gulp.src([
      `${paths.scripts.src}/modules/*.js`,
      `${paths.scripts.src}/base/*.js`
    ], { sourcemaps: true })
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(sourcemaps.init())
    .pipe(babel(config.babel))
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.scripts.dest));
}

export function scripts_libs() {
  return gulp.src([
      `${paths.scripts.src}/libs/first/*.js`,
      `${paths.scripts.src}/libs/*.js`
    ], { sourcemaps: true })
    // .pipe(concat('libs.js'))
    .pipe(gulp.dest(paths.scripts.dest));
}

const scripts = gulp.series(
  deleteScripts,
  scripts_libs,
  scripts_main
);
export { scripts };

const scripts_dev = gulp.series(
  deleteScripts,
  scripts_libs,
  scripts_main_dev
);
export { scripts_dev };


// HTML
export function html() {
  return gulp.src(`${paths.html.src}/**/*.html`)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(paths.html.dest));
}


// Images
export function deleteImages(done) {
  del([`${paths.images.dest}**/*`, `!${paths.images.dest}**/unicorn.jpg`]).then((paths) => {
    console.log('Deleted files and folders:\n', paths.join('\n'));
    done();
  });
}

export function imagemin_compress() {
  return gulp.src([
      `${paths.images.src}/**/*`,

      // not files / directories below
      `!${paths.images.src}/**/*.md`,
    ])
    .pipe(imagemin([
      // use mozjpeg if you have installed, (on mac you have to brew install libpng)
      // mozjpeg({progressive: true, quality: 85}),
      jpegtran({progessive: true}),
      pngquant({speed: 6, quality: 80})
    ]))
    .pipe(gulp.dest(paths.images.dest))
}

const images = gulp.series(
  deleteImages,
  imagemin_compress,
);
export { images };

// Geojson
export function geojson() {
  return gulp.src(`${paths.geojson.src}/**/*.geojson`)
    .pipe(rename({ extname: '.json' }))
    .pipe(gulp.dest(paths.geojson.dest));
}

/*
  TASKS
*/
const watch = () => {
  gulp.watch(`${paths.styles.src}/**/*.scss`, gulp.series(styles, reload));
  gulp.watch([
      `${paths.scripts.src}/modules/*.js`,
      `${paths.scripts.src}/base/*.js`
    ],
    gulp.series(gulp.parallel(scripts_main, scripts_libs), reload)
  );
  gulp.watch(`${paths.html.src}/**/*.html`, gulp.series(html));
};


const dev = gulp.series(
  gulp.parallel(html, styles, scripts_dev, geojson),
  serve,
  watch
);
export { dev };

const build = gulp.series(
  gulp.parallel(html, styles, scripts, geojson),
  images,
);
export { build };
