const Application = require('./lib/Application');
const request = require('request-promise');
const Module = require('./lib/Module');
const Script = require('./lib/Script');
const DeepMerge = require('deepmerge');
const readdirp = require('readdirp');
const Promise = require('bluebird');
const mpath = require('mpath');

module.exports = {
    Application: Application,
    Module: Module,
    Script: Script,
    Modules: {
        DeepMerge,
        readdirp,
        Promise,
        mpath,
        request
    }
};
