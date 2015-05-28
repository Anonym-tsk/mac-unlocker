'use strict';

/**
 * @param {grunt} grunt
 */
module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    grunt.initConfig({

        // Project config
        config: {
            path: {
                app: 'app',
                dist: 'dist',
                package: 'package'
            },
            package: grunt.file.readJSON('package.json')
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: ['scripts/{,*/}*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            styles: {
                files: ['css/{,*/}*.css'],
                tasks: [],
                options: {
                    livereload: true
                }
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '*.html',
                    'img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        // Grunt server and debug server setting
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                hostname: 'localhost'
            },
            debug: {
                options: {
                    open: false
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        'build/*'
                    ]
                }]
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                node: true,
                browser: true,
                esnext: true,
                bitwise: true,
                camelcase: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                indent: 2,
                latedef: true,
                newcap: true,
                noarg: true,
                quotmark: 'single',
                regexp: true,
                undef: true,
                unused: true,
                strict: true,
                trailing: true,
                smarttabs: true,
                validthis: true,
                expr: true,
                globals: {
                    define: true,
                    console: true
                },
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                'js/{,*/}*.js'
            ]
        },

        // Minify html
        htmlmin: {
            dist: {
                options: {
                    removeCommentsFromCDATA: true,
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeEmptyAttributes: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.path.app %>',
                    src: '*.html',
                    dest: '<%= config.path.dist %>'
                }]
            }
        },

        // Minify scripts
        uglify: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.path.app %>/scripts',
                    src: [
                        '{,*/}*.js',
                        '!lib/*.js',
                        '!chromereload.js'
                    ],
                    dest: '<%= config.path.dist %>/scripts'
                }]
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            assets: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.path.app %>',
                    dest: '<%= config.path.dist %>',
                    src: [
                        '_locales/{,*/}*.json',
                        'stations.json',
                        'scripts/lib/{,*/}*.js'
                    ]
                }]
            },
            html: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.path.app %>',
                    dest: '<%= config.path.dist %>',
                    src: '*.html'
                }]
            },
            js: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.path.app %>/scripts',
                    dest: '<%= config.path.dist %>/scripts',
                    src: [
                        '{,*/}*.js',
                        '!lib/*.js',
                        '!chromereload.js'
                    ]
                }]
            }
        },

        // Compres dist files to package
        compress: {
            chrome: {
                options: {
                    archive: 'package/chrome-<%= config.package.name %>-<%= config.package.version %>.zip'
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**'],
                    dest: ''
                }]
            },
            opera: {
                options: {
                    archive: 'package/opera-<%= config.package.name %>-<%= config.package.version %>.zip'
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**'],
                    dest: ''
                }]
            }
        }
    });

    grunt.registerTask('run', [
        'jshint',
        'connect',
        'watch'
    ]);

    grunt.registerTask('build', [
        'jshint',
        'clean',
        'manifestCopy',
        'sass:compressed',
        'imagemin',
        'htmlmin',
        'uglify',
        'copy:assets',
        'check',
        'compress:chrome'
    ]);

    grunt.registerTask('default', [
        'run'
    ]);
};
