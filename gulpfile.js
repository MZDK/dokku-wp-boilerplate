var gulp = require('gulp'),
		browserify = require('browserify'),
		streamify = require('gulp-streamify'),
		source = require('vinyl-source-stream'),
		gutil = require('gulp-util'),
		babelify = require('babelify'),
		php = require('gulp-connect-php'),
		clean = require('gulp-clean'),
		replace = require('gulp-replace-task');
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    header  = require('gulp-header'),
    rename = require('gulp-rename'),
    cssnano = require('gulp-cssnano'),
    sourcemaps = require('gulp-sourcemaps'),
    package = require('./package.json'),
		dependencies = ['react', 'react-dom'];



var theme = 'app/wp-content/themes/' + package.theme.textDomain;



var banner = [
  '/*\n' +
  ' Theme Name:		<%= package.theme.themeName %>\n' +
	' Theme URI:		<%= package.theme.themeUri %>\n' +
	' Description:	<%= package.theme.description %>\n' +
	' Author:				<%= package.theme.author %>\n' +
	' Author URI:		<%= package.theme.authorUri %>\n' +
	' Version: 			<%= package.theme.version %>\n' +
	' License:			<%= package.theme.license %>\n' +
	' License URI:	<%= package.theme.licenseUri %>\n' +
	' Tags:					<%= package.theme.tags %>\n' +
	' Text Domain:	<%= package.theme.textDomain %>\n' +
  ' */',
  '\n'
].join('');



gulp.task('scripts', function() {

	var appBundler = browserify({
		entries: './src/app.js',
		debug: true
	});

	dependencies.forEach(function(dep){
  	appBundler.external(dep);
  });

	appBundler.transform('babelify', {compact: false, presets: ['es2015', 'react']})
		.bundle().on('error',gutil.log)
		.pipe(source('main.js'))
		.pipe(gulp.dest('./' + theme + '/js'))
		.pipe(browserSync.stream());

});



gulp.task('styles', function () {
    return gulp.src('src/styles/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 4 version'))
    .pipe(gulp.dest(theme))
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest(theme))
    .pipe(browserSync.reload({stream:true}));
});



gulp.task('assets',function(){
    return gulp.src('src/assets/**/*')
      .pipe(gulp.dest(theme + '/assets/'));
});



gulp.task('templates',function(){
    return gulp.src('src/templates/**/*')
      .pipe(gulp.dest(theme));
});



gulp.task('cleanConfig', function () {
    return gulp.src('app/wp-config.php')
        .pipe(clean({force: true}))
});



gulp.task('setConfig', function () {
  gulp.src('src/wp-config.php')
    .pipe(replace({
      patterns: [
				{
          match: 'theme',
          replacement: package.theme.textDomain
        }
      ]
    }))
    .pipe(gulp.dest('app/'));
});



gulp.task('config', ['cleanConfig', 'setConfig']);



gulp.task('php', function() {
    php.server({ base: 'app', port: 8010, keepalive: true});
});



gulp.task('browser-sync',['php'], function() {
    browserSync({
        proxy: '127.0.0.1:8010',
        port: 8080,
        open: true,
        notify: false
    });
});



gulp.task('bs-reload', function () {
    browserSync.reload();
});



gulp.task('default', ['config', 'scripts', 'styles', 'assets',  'templates', 'browser-sync'], function () {

  gulp.watch("src/styles/**/*.scss", ['styles']);
  gulp.watch("src/**/*.js", ['scripts']);
	gulp.watch("src/assets/**/*", ['assets']);
	gulp.watch("src/templates/**/*", ['templates']);

	gulp.watch(['app/**/*.php', 'app/**/*.twig'], ['bs-reload']);

});

gulp.task('build', ['config', 'scripts', 'styles', 'assets',  'templates']);
