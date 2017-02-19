var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps'); // insert module
gulp.task('sass', function () {
	return gulp.src('sass/*.scss')
		.pipe(sourcemaps.init()) 
		.pipe(sass({
			errLogToConsole: true
		})) //error log in console
		.pipe(sass({
			outputStyle: 'compressed', //compression type
			sourceComments: 'map' // przetwarzanie komentarzy
		})).pipe(sourcemaps.write()) // sourcemap destination
		.pipe(gulp.dest('style')) // output css destination
})

gulp.task('watch', function () {
		gulp.watch('sass/*.scss', ['sass']);
	})

