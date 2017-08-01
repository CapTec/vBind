module.exports = function(grunt) {

  grunt.initConfig({
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        background: true
      },
      travis: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS2']
      }
    },
    watch: {
      karma: {
        files: ['src/**/*.js', 'test/unit/**/*.js'],
        tasks: ['karma:unit:run']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.registerTask('test', ['karma:travis']);
  grunt.registerTask('devmode', ['karma:unit', 'watch']);
};
