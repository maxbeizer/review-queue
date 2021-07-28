const core = require('@actions/core')

exports.log = (...args) => core.getInput('debug', {required: false}) && console.log(...args)
