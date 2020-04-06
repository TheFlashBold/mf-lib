/**
 * @type Module
 */
class Module {
    /** @type Application */
    app = null;
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
            return this.app.getConfig(this.name + (path ? '.' + path : ''), defaultValue);
        }
    };
    /**
     * Module name
     * @type {string}
     */
    name = 'module';
    /**
     * Logger
     * @type {{warn: function, error: function, info: function}}
     */
    log;

    constructor(app) {
        this.app = app;
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
