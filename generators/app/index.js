'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var _ = require('lodash');
var gitRemoteOriginUrl = require('git-remote-origin-url');
var askName = require('inquirer-npm-name');
var nameUsed = require('name-used');

module.exports = yeoman.generators.Base.extend({

  initializing: function () {
    var done = this.async();
    this.name = this.user.git.name();
    this.email = this.user.git.email();
    this.appName = _.kebabCase(path.basename(process.cwd()));
    this.props = {};
    this.user.github.username(function(err, username){
      this.gitUsername = username;
      done();
    }.bind(this));
  },

  prompting: function () {
    var done = this.async();
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the terrific ' + chalk.red('generator-simple-package') + ' generator!'
    ));

    var prompts = [{
      type: 'input',
      name: 'appName',
      message: 'Your generator name',
      default: this.appName
    }
    // ,{
    //   type: 'confirm',
    //   name: 'exist',
    //   message: 'The name above already exists on npm, choose another?',
    //   default: true,
    //   when: function (answers) {
    //     var done = this.async();
    //     nameUsed(answers.appName)
    //       .then(function (res) {
    //         done(res);
    //       })
    //   }
    // }
    ,{
      type: 'input',
      name: 'desc',
      message: 'Description'
    },{
      type: 'input',
      name: 'authorName',
      message: "Author's Name",
      default: this.name
    },{
      type: 'input',
      name: 'authorEmail',
      message: "Author's Email",
      default: this.email
    },{
      type: 'input',
      name: 'authorUrl',
      message: "Author's Homepage"
    }
    // ,{
    //   type: 'confirm',
    //   name: 'cover',
    //   message: 'Send coverage reports to coveralls',
    //   default: true
    // }
    ,{
      type: 'input',
      name: 'gitUsername',
      message: 'GitHub username or organization',
      default: this.gitUsername
    }];

    this.prompt(prompts, function (props) {
      this.props = props;
      done();
    }.bind(this));
  },

  writing: function () {
    var repository = path.join(this.props.gitUsername, this.props.appName);
    var repositoryUrl = path.join('https://github.com/', repository);

    this.pkg = {
      appName: this.props.appName,
      authorName: this.props.authorName,
      authorEmail: this.props.authorEmail,
      authorUrl: this.props.authorUrl,
      repositoryUrl: repositoryUrl,
      desc: this.props.desc,
      gitUsername: this.props.gitUsername,
      keys: this.props.keys,
      repository: repository
    }

    var template = [
      'gitignore', 
      'jshintrc', 
      'travis.yml', 
      'README.md', 
      'editorconfig', 
      'index.js', 
      'license', 
      'package.json', 
      'test.js'
    ];

    var file = [
      '.gitignore', 
      '.jshintrc', 
      '.travis.yml', 
      '.README.md', 
      'editorconfig', 
      'index.js', 
      'license', 
      'package.json', 
      'test.js'
    ];

    for (var i = 0; i < template.length; i++) {
      this.fs.copyTpl(
        this.templatePath(template[i]),
        this.destinationPath(file[i]),
        this.pkg
      );
    };
  },

  install: function () {
    this.npmInstall();
  },

  end: function () {

    var yeoSayBye = function (that) {
      that.log(yosay(
        'Enjoy your time with ' + chalk.red('generator-simple-package') + ' generator!'
      ));
    }
    // Borrow from generator-node
    // https://github.com/yeoman/generator-node/blob/8db5ce1ec6948d55d5c518e7f96aabf836b2081c/generators/git/index.js#L72
    gitRemoteOriginUrl().then(url => {
      yeoSayBye(this);
    })
    .catch(err => {
      this.spawnCommandSync('git', ['init']);
      var repoSSH = 'git@github.com:' + this.pkg.repository + '.git';
      this.spawnCommandSync('git', ['remote', 'add', 'origin', repoSSH]);
      yeoSayBye(this);
    })
  }
});
