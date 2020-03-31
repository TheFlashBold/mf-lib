const Application = require('./Application');

/**
 * @type Module
 */
class Module {
    /**
     * Module name
     * @type {string}
     */
    name = "module";
    /**
     * Config
     * @type {{get: (function(string, *=): {}|*)}}
     */
    config = {
        /**
         * Get module config
         * @param {string} path
         * @param {*} defaultValue
         * @return {*}
         */
        get: (path, defaultValue = undefined) => {
            return Application.getConfig(this.name + (path ? "." + path : ""), defaultValue);
        }
    };
    /**
     * Logger
     * @type {{warn: function, error: function, info: function}}
     */
    log = {
        warn: console.warn,
        error: console.error,
        log: console.log
    };

    constructor() {
    }

    async init() {

    }

    async initModule(module) {

    }

    async postInit() {

    }

    async stop() {

    }
}

module.exports = Module;
