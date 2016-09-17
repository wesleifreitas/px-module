var gulp = require('gulp');
// https://www.npmjs.com/package/gulp-webserver
var webserver = require('gulp-webserver');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var watch = require('gulp-watch');

gulp.task('serve', ['watch'], function() {
	gulp.src('')
		.pipe(webserver({
			livereload: {
				enable: false,
				filter: function(fileName) {
					if (fileName.match(/LICENSE|\.json$|\.md$|src$|lib$|node_modules/)) { // exclude all source maps from livereload
						return false;
					} else {
						//console.info(fileName);
						return true;
					}
				}
			},
			directoryListing: true,
			open: true
		}));
});

gulp.task('build-px-config-js', function() {
	return gulp
		.src(['./src/system/components/config/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(concat('px-config.js'))
		.pipe(gulp.dest('dist/px-config'));
});

gulp.task('release-px-config-js', function() {
	return gulp
		.src(['./src/system/components/config/*.js'])
		.pipe(concat('px-config.js'))
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/px-config'));
});

gulp.task('build-px-util-js', function() {
	return gulp
		.src(['./src/system/components/utils/js/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(concat('px-util.js'))
		.pipe(gulp.dest('dist/px-util'));
});

gulp.task('release-px-util-js', function() {
	return gulp
		.src(['./src/system/components/utils/js/*.js'])
		.pipe(concat('px-util.js'))
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/px-util'));
});

gulp.task('build-px-form-item-js', function() {
	return gulp
		.src(['./src/system/components/px-form-item/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(concat('px-form-item.js'))
		.pipe(gulp.dest('dist/px-form-item'));
});

gulp.task('release-px-form-item-js', function() {
	return gulp
		.src(['./src/system/components/px-form-item/*.js'])
		.pipe(concat('px-form-item.js'))
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/px-form-item'));
});

gulp.task('build-px-form-item-css', function() {
	return gulp
		.src(['./src/system/components/px-data-grid/*.css'])
		.pipe(gulp.dest('dist/px-data-grid'));
});

gulp.task('release-px-form-item-css', function() {
	return gulp
		.src(['./src/system/components/px-form-item/*.css'])
		.pipe(cssmin())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/px-form-item'));
});

gulp.task('build-px-data-grid-js', function() {
	return gulp
		.src(['./src/system/components/px-data-grid/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(concat('px-data-grid.js'))
		.pipe(gulp.dest('dist/px-data-grid'));
});


gulp.task('release-px-data-grid-js', function() {
	return gulp
		.src(['./src/system/components/px-data-grid/*.js'])
		.pipe(concat('px-data-grid.js'))
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/px-data-grid'));
});

gulp.task('build-px-data-grid-css', function() {
	return gulp
		.src(['./src/system/components/px-data-grid/*.css'])
		.pipe(gulp.dest('dist/px-data-grid'));
});

gulp.task('release-px-data-grid-css', function() {
	return gulp
		.src(['./src/system/components/px-data-grid/*.css'])
		.pipe(cssmin())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/px-data-grid'));
});

gulp.task('build-px-data-grid-fonts', function() {
	return gulp
		.src([
			'./src/system/components/px-data-grid/fonts/*.woff',
			'./src/system/components/px-data-grid/fonts/*.ttf'
		])
		.pipe(gulp.dest('dist/px-data-grid/fonts'));
});

gulp.task('build-px-full-js', function() {
	return gulp
		.src(['./src/system/components/config/*.js',
			'./src/system/components/utils/js/*.js',
			'./src/system/components/px-form-item/*.js',
			'./src/system/components/px-data-grid/*.js'
		])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(concat('px-full.js'))
		.pipe(gulp.dest('dist/px-full'));
});

gulp.task('build-px-full-css', function() {
	return gulp
		.src(['./src/system/components/px-data-grid/*.css',
			'./src/system/components/px-form-item/*.css'])
		.pipe(concat('px-full.css'))
		.pipe(gulp.dest('dist/px-full'));
});

gulp.task('release-px-full-js', function() {
	return gulp
		.src(['./src/system/components/config/*.js',
			'./src/system/components/utils/js/*.js',
			'./src/system/components/px-form-item/*.js',
			'./src/system/components/px-data-grid/*.js',
		])
		.pipe(concat('px-full.js'))
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/px-full'));
});

gulp.task('release-px-full-css', function() {
	return gulp
		.src(['./src/system/components/px-data-grid/*.css'])
		.pipe(concat('px-full.css'))
		.pipe(cssmin())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/px-full'));
});

gulp.task('default', [
	'build-px-config-js',
	'build-px-util-js',
	'build-px-form-item-js',
	'build-px-data-grid-js',
	'build-px-data-grid-css',
	'build-px-form-item-css',
	'build-px-data-grid-fonts',
	'build-px-full-js',
	'build-px-full-css'
]);

gulp.task('release', [
	'default',
	'release-px-config-js',
	'release-px-util-js',
	'release-px-form-item-js',
	'release-px-data-grid-js',
	'release-px-data-grid-css',
	'release-px-form-item-css',
	'release-px-full-js',
	'release-px-full-css'
]);

gulp.task('watch', function() {
	gulp.watch('./src/system/components/config/*.js', ['build-px-config-js']);
	gulp.watch('./src/system/components/utils/js/*.js', ['build-px-util-js']);
	gulp.watch('./src/system/components/px-form-item/*.js', ['build-px-form-item-js']);
	gulp.watch('./src/system/components/px-data-grid/*.js', ['build-px-data-grid-js']);
	gulp.watch('./src/system/components/px-data-grid/*.css', ['build-px-data-grid-css']);
	gulp.watch('./src/system/components/px-form-item/*.css', ['build-px-form-item-css']);
});