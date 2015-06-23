/**
 *
 *  Magical
 *  Copyright 2015 Bolord Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');

var AUTOPREFIXER_BROWSERS = [
    'ie >= 8',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function () {
        return gulp.src([
            'scripts/**/*.js'
        ])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'));
});

// Copy web fonts to dist
gulp.task('fonts', function () {
    return gulp.src([
        'fonts/**/*.{eot,svg,ttf,woff,woff2}',
        '!fonts/**/demo{,/**}'
    ])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Compile and automatically prefix stylesheets
gulp.task('styles', function () {
    // For best performance, don't add Less partials to `gulp.src`
    var combiner = require('stream-combiner2');

    var combined = combiner.obj([
        gulp.src([
            'less/magical.less'
        ]),
        $.changed('styles', {extension: '.less'}),
        $.sourcemaps.init(),
        $.less({}),
        $.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}),
        $.sourcemaps.write('.'),
        gulp.dest('dist/css'),
        // Concatenate And Minify Styles
        $.if('*.css', $.csso()),
        // gulp.dest('dist/styles'),
        $.size({title: 'styles'})
    ]);

    // any errors in the above streams will get caught
    // by this listener, instead of being thrown:
    combined.on('error', console.error.bind(console));

    return combined;
});

//
gulp.task('scripts', function () {
    return gulp.src([
        'scripts/**/*.js'
    ])
    .pipe($.uglify())
    .pipe($.concat('magical.js'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe($.size({title: 'scripts'}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['dist/*', '!dist/.git'], {dot: true}));

// Watch Files For Changes & Reload
gulp.task('serve', ['styles', 'scripts', 'fonts'], function () {
    gulp.watch(['less/**/*.{less,css}'], ['styles']);
    gulp.watch(['scripts/**/*.js'], ['jshint', 'scripts']);
    gulp.watch(['fonts/**/*', ['fonts']]);
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
    runSequence('styles', ['jshint', 'fonts', 'copy'], cb);
});

// Load custom tasks from the `tasks` directory
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }
