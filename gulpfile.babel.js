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

import mozjpeg from 'imagemin-mozjpeg';
import jpegtran from 'imagemin-jpegtran';
import pngquant from 'imagemin-pngquant';

import del from 'del';


/*
    CONFIG
*/
const paths = {
  styles: {
    src: 'src/sass',
    dest: './styles/'
  },
  scripts: {
    src: 'src/js',
    dest: './scripts/'
  },
  html: {
    src: 'src/html',
    dest: './'
  },
  images: {
    src: 'src/img',
    dest: './images/'
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

export function style_libs() {
  return gulp.src(`${paths.styles.src}/libs/*.scss`)
    .pipe(sass())
    .pipe(autoprefixer({
        browsers: config.browsers,
        cascade: false
    }))
    .pipe(cssnano())
    .pipe(gulp.dest(paths.styles.dest));
}

const styles = gulp.series(
  style_main,
  style_libs,
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


/*
  TASKS
*/
const build = gulp.series(
  gulp.parallel(html, styles, scripts),
  images,
);
export { build };
