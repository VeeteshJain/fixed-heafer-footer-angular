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
      options: {
        reporter: require('jshint-stylish')
      },
      all: [ 'Gruntfile.js', 'karma.conf.js', 'src/*.js' ]
    },
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      unit: {
        singleRun: true
      },
      continuous: {
        singleRun: false,
        autoWatch: true
      }
    },
    clean: {
      dist: {
        src: [ 'dist/*' ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-karma');

  //grunt.registerTask('default', ['jshint']);
  grunt.registerTask('concatDist', ['concat:dist']);
  grunt.registerTask('uglifyDist', ['uglify:dist']);
  grunt.registerTask('jshintDist', ['jshint:all']);
  grunt.registerTask('karmaUnit', ['karma:unit']);
  grunt.registerTask('cleanDist', ['clean:dist']);
  grunt.registerTask('build', ['jshint:all', 'karma:unit', 'clean:dist', 'concat:dist', 'uglify:dist']);
};