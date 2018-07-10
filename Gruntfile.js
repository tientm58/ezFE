// Generated on 2014-07-16 using generator-angular 0.9.5
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'
var fs = require('fs');
module.exports = function (grunt) {
    grunt.file.defaultEncoding = 'utf-8';
    grunt.file.preserveBOM = true;
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);
    var serveStatic = require('serve-static');
    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-scp');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-rename');

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: 'www'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({
        paths: {
            resources: './app',          // source files (scss)
            assets: './app'       // compiled files (css)
        },
        sass: {
            dev: {
                files: {
                    '<%= paths.assets %>/stylesheet/style.css' : '<%= paths.resources %>/sass/style.scss'
                },
                options: {
                    style: 'nested',
                    sourcemap: 'none'
                }
            }
        },
        // Project settings
        yeoman: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            sass: {
                files: [
                  '<%= paths.resources %>/sass/*.scss' // Write here the files that Grunt must watches
                ],
                tasks: ['sass:dev']
            },
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            js: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            html: {
                files: ['<%= yeoman.app %>/{,*/}*.html'],
                tasks: ['newer:copy:html'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            jsTest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['newer:jshint:test', 'karma']
            },
            styles: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
                tasks: ['newer:copy:styles', 'autoprefixer']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 1980,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: '0.0.0.0',//'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
              serveStatic('.tmp'),
              connect().use(
                                '/bower_components',
                                serveStatic('./bower_components')
              ),
              serveStatic(appConfig.app)
            ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    middleware: function (connect) {
                        return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= yeoman.dist %>'
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
          'Gruntfile.js',
          '<%= yeoman.app %>/scripts/{,*/}*.js'
        ]
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*/}*.js']
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
            '.tmp',
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
            },
            server: '.tmp'
        },

        // ngmin tries to make the code safe for minification automatically by
        // using the Angular long form for dependency injection. It doesn't work on
        // things like resolve or inject so those have to be done manually.
        ngmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: ['*.js', 'scripts/{,**/}*.js'],
                    dest: '<%= yeoman.dist %>'
              }]
            }
        },
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/',
                    src: ['*.js', 'scripts/{,**/}*.js'],
                    dest: '.tmp/concat'
              }]
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/img',
                    src: '{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= yeoman.dist %>/img'
              }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    removeComments: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: ['*.html', 'views/{,**/}*.html'],
                    dest: '<%= yeoman.dist %>'
              }]
            }
        },

        cssmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: ['*.css', 'styles/{,*/}*.css', 'stylesheet/{,*/}*.css'],
                    dest: '<%= yeoman.dist %>'
              }]
            }
        },
        cdnify: {
            dist: {
                options: {

                    rewriter: function (url) {
                        //grunt.log.writeln(url);
                        if (url.indexOf('bower_components') === 0 || url.indexOf('lib/') === 0) {

                            return '//ezcloudhotel.cdn.vccloud.vn/' + url;
                        } else
                            return url;
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: ['index.html'],
                    dest: '<%= yeoman.dist %>'
    }]
            }
        },

        uglify: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: ['scripts/{,**/}*.js'],
                    dest: '<%= yeoman.dist %>'
              }]
            }
        },

        removelogging: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/',
                    src: ['*.js', 'scripts/{,**/}*.js'],
                    dest: '.tmp/concat/'
              }]
            }
        },

        //
        //        concat: {
        //            dist: {
        //                files: [{
        //                    expand: true,
        //                    cwd: '<%= yeoman.app %>',
        //                    src: ['*.js', 'scripts/{,**/}*.js'],
        //                    dest: 'www/a.js'
        //                }]
        //            }
        //          },
        // Copies remaining files to places other tasks can use
        copy: {
            afterpackage: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'www',
                    dest: '../apps/android/ezcloudhotel/www',
                    src: [
                            '**/*'

              ]
          }]
            },
            package: {
                files: [{
                        expand: true,
                        dot: true,
                        cwd: '<%= yeoman.app %>',
                        dest: 'www',
                        src: [
                            'lib/**/*',
                            'scripts/draggableSidenav.js',
                            '*.html',
                            'views/{,**/}*.html',
                            'ReportViewer/**/*',
                            'img/{,**/}*',
                            'stylesheet/*'

              ]
          },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'bower_components',
                        dest: 'www/bower_components',
                        src: [
//                  '*.{ico,png,txt}',
//                  '.htaccess',
//                  '*.html',
//                  'views/{,*/}*.html',
//                  'images/{,*/}*.{webp}',
//                  'fonts/*'
                      '**/*'
                  ]
              }]
            },
            js: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: 'www',
                    src: [
                        'scripts/services/dialogService.js'
                    ]
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/{,*/}*.html',
            'images/{,*/}*.{webp}',
            'fonts/*'
          ]
        }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: ['generated/*']
        }, {
                    expand: true,
                    cwd: 'bower_components',
                    src: ['**/*'],
                    dest: '<%= yeoman.dist %>/bower_components'
        }]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            },
            html: {
                expand: true,
                cwd: '<%= yeoman.app %>',
                dest: '.tmp',
                src: '{,*/}*.html'
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
        'copy:styles'
      ],
            test: [
        'copy:styles'
      ],
            dist: [
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
        },

        // Test settings
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        },
        wiredep: {
            target: {
                src: 'index.html' // point to your HTML file.
            }
        },
        filerev: {
            options: {
                algorithm: 'md5',
                length: 8
            },
            appjs: {
                src: '<%= yeoman.dist %>/scripts/app.js'
            }
        },
        useminPrepare: {
            html: 'app/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: '<%= yeoman.dist %>/index.html',
            options: {
                assetsDirs: ['<%= yeoman.dist %>']
            }
        },
        scp: {

            ezcloudi: {
                options: {
                    host: '123.31.31.122',
                    username: 'ezcloud',
					port:22001
                },
                files: [{
                    cwd: 'www',
                    src: '**/*',
                    filter: 'isFile',
                    // path on the server 
                    dest: '/opt/ezcloudi.com/'
                }]
            },branchtest: {
                options: {
                    host: '123.31.31.122',
                    username: 'ezcloud',
					port:22001
                },
                files: [{
                    cwd: 'www',
                    src: '**/*',
                    filter: 'isFile',
                    // path on the server 
                    dest: '/opt/branchtest.ezcloudi.com/'
                }]
            },
            ezcloudhotel: {
                options: {
                    host: 'pms.ezcloudhotel.com',
					port: 22001,
					username: 'ezcloud',
					readyTimeout:99999
                },
                files: [{
                    cwd: 'www',
                    src: '**/*',
                    filter: 'isFile',
                    // path on the server 
                    dest: '/opt/pms.ezcloudhotel.com'
                }]
            },
            ezcloudos: {
                options: {
                    host: '123.31.31.122',
					port: 22001,
					username: 'outsource',
					readyTimeout:99999
                },
                files: [{
                    cwd: 'www',
                    src: '**/*',
                    filter: 'isFile',
                    // path on the server 
                    dest: '/opt/os.ezcloudi.com'
                }]
            },
            ezcloudlongnh: {
                options: {
                    host: '123.31.31.122',
					port: 22001,
					username: 'longnh',
					readyTimeout:99999
                },
                files: [{
                    cwd: 'www',
                    src: '**/*',
                    filter: 'isFile',
                    // path on the server 
                    dest: '/opt/longnh.ezcloudi.com'
                }]
            }
        },
        replace: {
            script_template: {
                src: ['www/scripts/*.js'],
                overwrite: true,
                options: {
                    processTemplates: false
                },
                replacements: [{
                    from: 'views/',
                    to: function () {
                        return "views" + filerevVersion + "/";
                    }
    }]
            },
            view_template: {
                src: ['www/views/**/*.html','www/index.html'],
                overwrite: true,
                options: {
                    processTemplates: false
                },
                replacements: [{
                    from: 'views/',
                    to: function () {
                        //grunt.log.warn("alo");
                        return "views" + filerevVersion + "/";
                    }
    }]
            }
        }

    });
    var filerevVersion;
    grunt.registerTask('getVersion', 'Get Version app.js and create version.json', function (target) {

        var fileList = grunt.file.expand("www/scripts/app.*.js");
        var scriptName = fileList[0];
        var versionId = scriptName.match(/app\.(.*?)\.js/i);
        var jsoncontent = {

            version: versionId[1]
        };
        filerevVersion = versionId[1];
        grunt.file.write("www/version.json", JSON.stringify(jsoncontent));
        

    });
    grunt.registerTask('changeFolderName', 'change folder name', function (target) {

        fs.renameSync("www/views", "www/views" + filerevVersion);

    });
    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);
    grunt.registerTask('cdnify-test', ['cdnify:test']);

    grunt.registerTask('package', [
        'clean:dist',
        'copy:package',
        'useminPrepare',
        'concat',
      'cssmin',
        'removelogging',
      'ngAnnotate',
      'uglify',
      'filerev',
        'imagemin',
        'usemin',
        'getVersion',
        'replace',
        'changeFolderName'
		//'htmlmin',
        //'copy:afterpackage',
        //'cdnify:dist'
    ]);

    grunt.registerTask('deploy', [
        'scp:ezcloudi'
   // 'htmlmin'
//    'htmlmin'
//    'package'
  ]);
  grunt.registerTask('deploy2', [
        'scp:branchtest'
   // 'htmlmin'
//    'htmlmin'
//    'package'
  ]);
    grunt.registerTask('deploylive', [
        'scp:ezcloudhotel'
   // 'htmlmin'
//    'htmlmin'
//    'package'
  ]);
  grunt.registerTask('deployos', [
        'scp:ezcloudos'
   // 'htmlmin'
//    'htmlmin'
//    'package'
  ]);
  grunt.registerTask('deployl', [
        'scp:ezcloudlongnh'
   // 'htmlmin'
//    'htmlmin'
//    'package'
  ]);
  
  
    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'connect:livereload',
      'watch'
    ]);
    });
    /*grunt.registerTask('default', [
      'newer:jshint',
      'test',
      'build'
    ]);*/
    grunt.registerTask('default', 'Compile then start a connect web server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'connect:livereload',
      'watch'
    ]);
    });
};