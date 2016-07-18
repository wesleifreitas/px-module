var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var watch = require('gulp-watch');

gulp.task('build-px-util-js', function() {
	return gulp
		.src(['./src/system/components/utils/js/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(concat('px-util.js'))
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/px-util'));
});

gulp.task('source-px-util-js', function() {
	return gulp
		.src(['./src/system/components/utils/js/*.js'])
		.pipe(concat('px-util.js'))
		.pipe(gulp.dest('dist/px-util'));
});

gulp.task('build-px-form-item-js', function() {
	return gulp
		.src(['./src/system/components/px-form-item/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(concat('px-form-item.js'))
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/px-form-item'));
});

gulp.task('source-px-form-item-js', function() {
	return gulp
		.src(['./src/system/components/px-form-item/*.js'])
		.pipe(concat('px-form-item.js'))
		.pipe(gulp.dest('dist/px-form-item'));
});

gulp.task('build-px-data-grid-js', function() {
	return gulp
		.src(['./src/system/components/px-data-grid/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(concat('px-data-grid.js'))
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/px-data-grid'));
});

gulp.task('source-px-data-grid-js', function() {
	return gulp
		.src(['./src/system/components/px-data-grid/*.js'])
		.pipe(concat('px-data-grid.js'))
		.pipe(gulp.dest('dist/px-data-grid'));
});

gulp.task('default', [
	'build-px-util-js',
	'build-px-form-item-js',
	'build-px-data-grid-js'
]);

gulp.task('release', [
	'default',
	'source-px-util-js',
	'source-px-form-item-js',
	'source-px-data-grid-js'
]);

gulp.task('watch', function() {
	gulp.watch('./src/system/components/utils/js/*.js', ['build-px-util-js']);
	gulp.watch('./src/system/components/px-form-item/*.js', ['build-px-form-item-js']);
	gulp.watch('./src/system/components/px-data-grid/*.js', ['build-px-data-grid-js']);
});