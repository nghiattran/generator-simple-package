'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-simple-package', function () {
  before(function (done) {
    this.answers = {
      appName: 'someAPP_?',
      desc: 'A node generator',
      gitUsername: 'yeoman',
      authorName: 'The Yeoman Team',
      authorEmail: 'hi@yeoman.io',
      authorUrl: 'http://yeoman.io',
      keys: ['foo', 'bar']
    };

    helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts(this.answers)
      .on('err', function (err) {
        console.log(err);
        done
      })
      .on('end', done);
  });

  it('creates files', function () {
    assert.file([
      '.gitignore',
      '.jshintrc',
      '.travis.yml',
      'README.md',
      'editorconfig',
      'index.js',
      'license',
      'package.json',
      'test.js'
    ]);
  });

  it('creates package.json', function () {
    assert.file('package.json');
    assert.jsonFileContent('package.json', {
      name: this.answers.appName,
      version: '0.0.0',
      description: this.answers.desc,
      repository: path.join(this.answers.gitUsername, this.answers.appName),
      author: {
        name: this.answers.authorName,
        email: this.answers.authorEmail,
        url: this.answers.authorUrl
      },
      files: ['index.js'],
      main: 'index.js'
    });
  });

  it('creates and fill contents in README.md', function () {
    assert.file('README.md');
    assert.fileContent('README.md', '# ' + this.answers.appName);
    assert.fileContent('README.md', 'MIT © [' + this.answers.authorName +  '](' + this.answers.authorUrl + ')');
    assert.fileContent('README.md', '[travis-image]: https://travis-ci.org/' + path.join(this.answers.gitUsername, this.answers.appName)+ '.svg?branch=master');
    assert.fileContent('README.md', 'coveralls');
  });
});
