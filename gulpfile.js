import gulp from 'gulp';
import clean from 'gulp-clean';
import zip from 'gulp-zip';

const paths = {
   css: {
      src: 'assets/css/*-min.css',
      dest: 'houseparty/assets/css/'
   },
   pagesjs: {
      src: 'assets/js/pages/*-min.js',
      dest: 'houseparty/assets/js/pages/'
   },
   utiljs: {
      src: 'assets/js/util/*-min.js',
      dest: 'houseparty/assets/js/util/'
   },
   php: {
      src: 'assets/php/*.php',
      dest: 'houseparty/assets/php/'
   },
   wesbitephp: {
      src: 'assets/php/website/*.php',
      dest: 'houseparty/assets/php/website/'
   },
   serverphp: {
      src: 'assets/php/server/*.php',
      dest: 'houseparty/assets/php/server/'
   },
   images: {
      src: 'assets/images/*.ico',
      dest: 'houseparty/assets/images/'
   },
   html: {
      src: '*.html',
      dest: 'houseparty/'
   },
   cleanfolder: 'houseparty',
   cleanzip: 'houseparty.zip',
   zip: 'houseparty/**/*'
};

function copyCss() {
   return gulp.src(paths.css.src)
      .pipe(gulp.dest(paths.css.dest));
}

function copyPagesJs() {
   return gulp.src(paths.pagesjs.src)
      .pipe(gulp.dest(paths.pagesjs.dest));
}

function copyUtilJs() {
   return gulp.src(paths.utiljs.src)
      .pipe(gulp.dest(paths.utiljs.dest));
}

function copyPhp() {
   return gulp.src(paths.php.src)
      .pipe(gulp.dest(paths.php.dest));
}

function copyWebsitePhp() {
   return gulp.src(paths.wesbitephp.src)
      .pipe(gulp.dest(paths.wesbitephp.dest));
}

function copyServerPhp() {
   return gulp.src(paths.serverphp.src)
      .pipe(gulp.dest(paths.serverphp.dest));
}

function copyImages() {
   return gulp.src(paths.images.src)
      .pipe(gulp.dest(paths.images.dest));
}

function copyHtml() {
   return gulp.src(paths.html.src)
      .pipe(gulp.dest(paths.html.dest));
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

const build = gulp.series(cleanzip, gulp.parallel(copyCss, copyPagesJs, copyUtilJs, copyPhp, copyWebsitePhp, copyServerPhp, copyImages, copyHtml), zipDist, cleanfolder);

export {
   copyCss,
   copyPagesJs,
   copyUtilJs,
   copyPhp,
   copyWebsitePhp,
   copyServerPhp,
   copyImages,
   copyHtml,
   zipDist,
   cleanfolder,
   cleanzip,
   build
};

export default build;