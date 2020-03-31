const Application = require('./lib/Application');
const request = require('request-promise');
const Module = require('./lib/Module');
const DeepMerge = require('deepmerge');
const readdirp = require('readdirp');
const Promise = require('bluebird');
const mpath = require('mpath');

module.exports = {
    Application: Application,
    Module: Module,
    Modules: {
        DeepMerge,
        readdirp,
        Promise,
        mpath,
        request
    }
};
