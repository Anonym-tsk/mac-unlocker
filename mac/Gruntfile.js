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
            package: grunt.file.readJSON('package.json')
        },

        // Run app
        run: {
            nw: {
                cmd: '/usr/local/lib/node_modules/nw/nwjs/nwjs.app/Contents/MacOS/nwjs',
                args: ['.'],
                options: {
                    wait: true,
                    itterable: true
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
            js: ['js/{,*/}*.js'],
            gruntfile: ['Gruntfile.js']
        }
    });

    grunt.registerTask('nwbuild', function() {
        var exec = require('child_process').exec,
            done = this.async(),
            name = grunt.config.get('config.package.name'),
            version = process.versions.node,
            arch = (process.arch === 'x64' ? 'osx64' : 'osx32');

        exec('nwbuild -v ' + version + ' -p ' + arch + ' .', function(err) {
            if (!err) {
                grunt.file.copy('./img/lock.icns', './build/' + name + '/' + arch + '/' + name + '.app/Contents/Resources/nw.icns');
            }
            done(!err);
        });
    });

    grunt.registerTask('build', [
        'jshint',
        'clean',
        'nwbuild'
    ]);

    grunt.registerTask('default', [
        'run'
    ]);
};
