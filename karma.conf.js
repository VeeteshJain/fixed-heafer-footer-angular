module.exports = function(config) {
  config.set({
    basePath: './',
    frameworks: [ 'jasmine' ],
    files: [
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    //'bower_components/angular-scenario/angular-scenario.js',
    'src/**/*.js',
    'tests/**/*.js',
    //'main-test.js'
    ],
    exclude: ['bower_components/*'],
    reporters: [ 'progress' ],
    colors: true,
    autoWatch: false,
    browsers: [ 'PhantomJS' ],
    singleRun: true,
    plugins: [
    'karma-phantomjs-launcher',
    'karma-jasmine'
    ]
});
};