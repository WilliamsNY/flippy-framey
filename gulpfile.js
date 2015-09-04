var gulp   = require('gulp');
var ugly   = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('min', function() {
    return gulp.src('flippy-framey.js')
        .pipe(ugly())
        .pipe(concat('flippy-framey.min.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['min']);
