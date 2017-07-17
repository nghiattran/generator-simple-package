'use strict';
const yeoman = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const _ = require('lodash');
const gitRemoteOriginUrl = require('git-remote-origin-url');
const nameUsed = require('name-used');
const githubUsername = require('github-username');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    let done = this.async();
    this.name = this.user.git.name() || '';
    this.email = this.user.git.email() || '';
    this.appName = _.kebabCase(path.basename(process.cwd()));
    this.props = {};
    let self = this;

    if (this.email !== '') {
      githubUsername(this.email, function (err, username) {
        self.gitUsername = username || self.name || '';
        done();
      })
    } else {
      self.gitUsername = self.name || '';
      done();
    }
  },

  prompting: function () {
    let done = this.async();
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the terrific ' + chalk.red('generator-simple-package') + ' generator!'
    ));

    let prompts = [{
      type: 'input',
      name: 'appName',
      message: 'Your generator name',
      default: this.appName
    },
    {
      type: 'confirm',
      name: 'exist',
      message: 'The name above already exists on npm, choose another?',
      default: true,
      when: function (answers) {
        let done = this.async();
        nameUsed(answers.appName)
          .then(function (res) {
            done(res);
          })
      }
    },
    {
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
    let repository = '';
    let repositoryUrl = '';

    if (this.props.gitUsername != '') {
      repository = path.join(this.props.gitUsername, this.props.appName);
      repositoryUrl = path.join('https://github.com/', repository);
    };

    this.pkg = {
      appName: this.props.appName,
      appNameCamel: _.camelCase(this.props.appName),
      authorName: this.props.authorName,
      authorEmail: this.props.authorEmail,
      authorUrl: this.props.authorUrl,
      repositoryUrl: repositoryUrl,
      desc: this.props.desc,
      gitUsername: this.props.gitUsername,
      keys: this.props.keys,
      repository: repository
    }

    let dotFiles = [
      'gitignore', 
      'jshintrc', 
      'travis.yml'
    ]
    let normalFiles = [ 
      'README.md', 
      'editorconfig', 
      'index.js', 
      'LICENSE', 
      'package.json', 
      'test.js'
    ];

    for (let i = 0; i < normalFiles.length; i++) {
      this.fs.copyTpl(
        this.templatePath('_' + normalFiles[i]),
        this.destinationPath(normalFiles[i]),
        this.pkg
      );
    };

    for (let i = 0; i < dotFiles.length; i++) {
      this.fs.copy(
        this.templatePath('_' + dotFiles[i]),
        this.destinationPath('.' + dotFiles[i])
      );
    };
  },

  install: function () {
    this.npmInstall();
  },

  end: function () {
    let self = this;

    let yeoSayBye = function (self) {
      self.log(yosay(
        'Enjoy your time with ' + chalk.red('generator-simple-package') + ' generator!'
      ));
    }

    // Borrow from generator-node
    // https://github.com/yeoman/generator-node/blob/8db5ce1ec6948d55d5c518e7f96aabf836b2081c/generators/git/index.js#L72
    gitRemoteOriginUrl()
      .then(function (url){
        yeoSayBye(self);
      })
      .catch(function (url){
        self.spawnCommandSync('git', ['init']);
        let repoSSH = 'git@github.com:' + self.pkg.repository + '.git';
        self.spawnCommandSync('git', ['remote', 'add', 'origin', repoSSH]);
        yeoSayBye(self);
      });
  }
});
