const gulp = require('gulp');
const inline = require('gulp-inline');
const path = require('path');
const base64 = require('gulp-base64');
const htmlmin = require('gulp-htmlmin');
const through = require('through2');
const fs = require('fs');

function inlineAudio() {
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }
        if (file.isStream()) {
            return cb(new Error('Streaming not supported'));
        }

        let contents = file.contents.toString();

        const audioSourceRegex = /<source([^>]*?)src=(["'])([^"']+\.mp3)\2([^>]*?)>/g;

        contents = contents.replace(audioSourceRegex, (match, before, quote, srcValue, after) => {
            try {
                const audioFilePath = path.join(path.dirname(file.path), srcValue);
                const audioData = fs.readFileSync(audioFilePath);
                const base64Audio = audioData.toString('base64');

                const dataUri = `data:audio/mpeg;base64,${base64Audio}`;

                return `<source${before}src="${dataUri}"${after}>`;
            } catch (err) {
                console.error('Ошибка при встраивании аудио:', err);
                return match;
            }
        });

        file.contents = Buffer.from(contents);

        cb(null, file);
    });
}

gulp.task('inline-and-minify', function () {
    return gulp.src('index.html')
        .pipe(inline({
            base: './',
            ignore: []
        }))
        .pipe(base64({
            maxImageSize: 3000 * 1024,
            baseDir: __dirname,
            debug: true
        }))
        .pipe(inlineAudio())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true
        }))
        .pipe(gulp.dest('docs/'));
});

gulp.task('default', gulp.series('inline-and-minify'));
