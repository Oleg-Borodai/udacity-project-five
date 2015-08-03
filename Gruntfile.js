module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['build'],
        bowercopy: {
            dev: {
                files: {
                    // Keys are destinations (prefixed with `options.destPrefix`)
                    // Values are sources (prefixed with `options.srcPrefix`); One source per destination
                    // e.g. 'bower_components/chai/lib/chai.js' will be copied to 'test/js/libs/chai.js'
                    'js/jquery.js': 'jquery/dist/jquery.js',
                    'css/bootstrap.css': 'bootstrap/dist/css/bootstrap.css',
                    'js/knockout.js': 'knockout/dist/knockout.js'
                }
            }
        },
        copy: {
            build: {
                src: ['**', '!build/**', '!node_modules/**',
                    '!bower_components/**','!Gruntfile.js', '!ngrok',
                    '!package.json', '!bower.json',
                    '!README.md', '!**/*.css', '!**/*.js', '!**/*.html'
                ],
                dest: 'build',
                expand: true
            }
        },
        htmlmin: {
            html: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyJS: true,
                    minifyCSS: true
                },
                files: [{
                    expand: true,
                    cwd: '.',
                    src: ['**/*.html', '!node_modules/**', '!build/**',
                        '!bower_components/**'],
                    dest: 'build/'
                }]
            }
        },
        cssmin: {
            css: {
                files: [{
                    expand: true,
                    cwd: '.',
                    src: ['**/*.css', '!node_modules/**', '!build/**',
                        '!bower_components/**'],
                    dest: 'build/'
                }]
            }
        },
        uglify: {
            js: {
                files: [{
                    cwd: '.',
                    src: ['**/*.js', '!node_modules/**', '!build/**',
                        '!Gruntfile.js', '!bower_components/**'
                    ],
                    dest: 'build/',
                    expand: true
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.registerTask('default', ['clean',
        'bowercopy',
        'copy',
        'htmlmin:html',
        'cssmin:css',
        'uglify:js'
    ]);
};
