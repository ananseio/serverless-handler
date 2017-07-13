import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as path from 'path';
import merge = require('merge-stream');
import jasmine = require('gulp-jasmine');
import del = require('del');
import sourcemaps = require('gulp-sourcemaps');

const proj = ts.createProject('src/tsconfig.json');
const srcGlob = 'src/**/*.ts';
const distGlob = 'dist/**/*.js';
const testGlob = 'dist/**/*.spec.js';

gulp.task('default',['build']);

gulp.task('clean', () => {
  return del(distGlob);
});

gulp.task('build', ['clean'], () => {
  const tsResult = gulp.src(srcGlob, { base: 'src' })
    .pipe(sourcemaps.init())
    .pipe(proj());

  return merge(
    tsResult.js
      .pipe(sourcemaps.write({
        sourceRoot: (file: any) => path.relative(path.dirname(file.path), path.join(__dirname, 'dist'))
      }))
      .pipe(gulp.dest('dist')),
    tsResult.dts
      .pipe(gulp.dest('dist')));
});

gulp.task('watch', ['build'], () => {
  gulp.watch(srcGlob, ['build']);
});

gulp.task('test', ['build'], () => {
  return gulp.src(testGlob)
    .pipe(jasmine());
});
