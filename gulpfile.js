import gulp from 'gulp';
import clean from 'gulp-clean';
import zip from 'gulp-zip';
import chmod from 'gulp-chmod';
import filter from 'gulp-filter';

const paths = {
   html: {
      src: '*.html',
      dest: 'houseparty/'
   },
   css: {
      src: 'assets/css/*-min.css',
      dest: 'houseparty/assets/css/'
   },
   fonts: {
      src: 'assets/fonts/**/*',
      dest: 'houseparty/assets/fonts/'
   },
   images: {
      src: 'assets/images/*.ico',
      dest: 'houseparty/assets/images/'
   },
   js: {
      src: 'assets/js/**/*-min.js',
      dest: 'houseparty/assets/js/'
   },
   php: {
      src: 'assets/php/**/*.php',
      dest: 'houseparty/assets/php/'
   },
   cleanfolder: 'houseparty',
   cleanzip: 'houseparty.zip',
   zip: 'houseparty/**/*'
};

function html() {
   return gulp.src(paths.html.src)
      .pipe(chmod(0o644))
      .pipe(gulp.dest(paths.html.dest));
}

function css() {
   return gulp.src(paths.css.src)
      .pipe(chmod(0o644))
      .pipe(gulp.dest(paths.css.dest));
}

function fonts() {
   return gulp.src(paths.fonts.src)
      .pipe(chmod(0o644))
      .pipe(gulp.dest(paths.fonts.dest));
}

function images() {
   return gulp.src(paths.images.src)
      .pipe(chmod(0o644))
      .pipe(gulp.dest(paths.images.dest));
}

function js() {
   return gulp.src(paths.js.src)
      .pipe(chmod(0o644))
      .pipe(gulp.dest(paths.js.dest));
}

function php() {
   const exampleFilter = filter(['**', '!**/*example*'], { restore: true });
   const serverFilter = filter(['**/server/**/*'], { restore: true });
   const websiteFilter = filter(['**/website/**/*'], { restore: true });
   const secretFilter = filter(['**/secrets.php*'], { restore: true });

   return gulp.src(paths.php.src)
      .pipe(exampleFilter)
      .pipe(serverFilter)
      .pipe(chmod(0o700))
      .pipe(gulp.dest('houseparty/assets/php/server'))
      .pipe(serverFilter.restore)
      .pipe(websiteFilter)
      .pipe(chmod(0o755))
      .pipe(gulp.dest('houseparty/assets/php/website'))
      .pipe(websiteFilter.restore)
      .pipe(secretFilter)
      .pipe(chmod(0o700))
      .pipe(gulp.dest('houseparty/assets/php'))
      .pipe(secretFilter.restore)
      .pipe(exampleFilter.restore);
}

function zipDist() {
   return gulp.src(paths.zip)
      .pipe(zip('houseparty.zip'))
      .pipe(gulp.dest('.'));
}

function cleanfolder() {
   return gulp.src(paths.cleanfolder, { read: false })
      .pipe(clean());
}

function cleanzip() {
   return gulp.src(paths.cleanzip, { allowEmpty: true, read: false })
      .pipe(clean());
}

const build = gulp.series(cleanzip, gulp.parallel(html, css, fonts, images, js, php), zipDist, cleanfolder);

export {
   html,
   css,
   fonts,
   images,
   js,
   php,
   zipDist,
   cleanfolder,
   cleanzip,
   build
};

export default build;