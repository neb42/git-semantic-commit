#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { execSync } = require('child_process');

function readGitConfig() {
  const local = execSync('git config --local --get semantic.scope');
  if (local) {
    return local.toString('utf8').split(' ');
  }

  const global = execSync('git config --global --get semantic.scope');
  if (global) {
    return global.toString('utf8').split(' ');
  }

  const system = execSync('git config --system --get semantic.scope');
  if (system) {
    return system.toString('utf8').split(' ');
  }

  return [];
}

function promptUser(callback) {
  const scopes = readGitConfig().map(s => s.trim());
  scopes.push('None');
  const questions = [
    {
      name: 'commitType',
      type: 'list',
      message: 'What type of commit is this:',
      choices: [
        'feat',
        'fix',
        'style',
        'test',
        'refactor',
        'chore',
        'docs',
      ],
    },
    {
      name: 'scope',
      type: 'list',
      message: 'What is the scope of this commit:',
      choices: scopes,
    },
    {
      name: 'message',
      type: 'input',
      message: 'Enter your commit message:',
      validate: function(value) {
        if (!value.length) {
          return 'Please enter a commit message';
        }
        return true;
      }
    },
  ];

  inquirer.prompt(questions).then(callback);
}

function run() {
  promptUser(function() {
    const { commitType, scope, message } = arguments['0'];
    const result = execSync(`git commit -m '${commitType}(${scope}): ${message}'`);
    console.info(result.toString('utf8'));
  });
}

run();
