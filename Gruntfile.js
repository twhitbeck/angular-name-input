module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      dev: {
        files: ['angular-name-input.js', 'test/**/*.html'],
        options: {
          livereload: true
        }
      }
    },

    connect: {
      server: {
        options: {
          livereload: true
        }
      },
      standalone: {
        options: {
          keepalive: true
	}
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('serve', ['connect:standalone']);
  grunt.registerTask('dev', ['connect:server', 'watch:dev']);
};
