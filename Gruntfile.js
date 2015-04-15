module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      dist: {
        src: [ 'src/*.js'],
        dest: 'dist/fixedHeaderFooterModule.js'
      }
    },
    uglify: {
      dist: {
        files: [{
          expand: true,
          cwd: 'dist',
          src: '**/*.js',
          dest: 'dist',
          ext: '.min.js'
        }],
        options: {
          mangle: false
        }
      }
    },
    jshint: {
      all: [ 'Gruntfile.js', 'app/*.js', 'app/**/*.js' ]
    },
    karma: {
      options: {
        configFile: 'config/karma.conf.js'
      },
      unit: {
        singleRun: true
      },
      continuous: {
        singleRun: false,
        autoWatch: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');

  //grunt.registerTask('default', ['jshint']);
  grunt.registerTask('concatDist', ['concat:dist']);
  grunt.registerTask('uglifyDist', ['uglify:dist']);
  grunt.registerTask('jshintDist', ['jshint:all']);
  grunt.registerTask('karmaUnit', ['karma:unit']);
  grunt.registerTask('build', ['concat:dist', 'uglify:dist']);
};