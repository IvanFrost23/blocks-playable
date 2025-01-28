const gulp = require('gulp');
const inline = require('gulp-inline');
const path = require('path');
const base64 = require('gulp-base64');
const htmlmin = require('gulp-htmlmin');

gulp.task('inline-and-minify', function () {
    return gulp.src('index.html')
        .pipe(inline({
            base: '',
            ignore: []
        }))
        .pipe(base64({
            maxImageSize: 3000 * 1024,
            baseDir: path.join(__dirname, 'css/'),
            debug: true
        }))
        .pipe(
            htmlmin({
                collapseWhitespace: true,
                removeComments: true,
                minifyCSS: true,
                minifyJS: true
            })
        )
        .pipe(gulp.dest('docs/'));
});

gulp.task('default', gulp.series('inline-and-minify'));
