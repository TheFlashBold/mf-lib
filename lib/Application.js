const DeepMerge = require('deepmerge');
const readdirp = require('readdirp');
const Promise = require('bluebird');
const Colors = require('./Colors');
const mpath = require('mpath');
const path = require('path');
const fs = require('fs');

/**
 * @type Application
 */
class Application {
    static config = {};
    dirname = process.cwd();
    modules = {};
    log = {};

    constructor() {
        this.log = this.getLogger("app");
        this.init = this.init.bind(this);
        this.loadModule = this.loadModule.bind(this);
    }

    async loadConfigs() {
        for await (let {fullPath, path: fileName} of readdirp(path.resolve(this.dirname, "config"), {fileFilter: "*.json"})) {
            try {
                let configContent = fs.readFileSync(fullPath, 'UTF-8');
                configContent = JSON.parse(configContent);
                fileName = fileName.replace(/\..*?$/, "");
                Application.config[fileName] = DeepMerge.all([Application.config[fileName] || {}, configContent]);
            } catch (e) {
                this.log.error("Failed to load config", fileName);
            }
        }
    }

    async init() {
        process.stdin.resume();
        await this.loadConfigs();
        await this.initModules();
    }

    async initModules() {
        await Promise.map(Object.entries(this.modules), async ([moduleName, module]) => {
            module.log = this.getLogger(moduleName);
            await module.init();
        });

        for (let [, module] of Object.entries(this.modules)) {
            for (let [, otherModule] of Object.entries(this.modules)) {
                if (module !== otherModule) {
                    await module.initModule(otherModule);
                }
            }
        }

        await Promise.map(Object.entries(this.modules), async ([, module]) => module.postInit());
    }

    async stop() {
        await Promise.map(Object.entries(this.modules), async ([, module]) => module.stop());
    }

    /**
     * @param {string} module
     * @param {object} moduleClass
     * @returns {Promise<void>}
     */
    loadModule(module, moduleClass) {
        moduleClass.name = module;
        this.modules[module] = moduleClass;
    }

    /**
     * Get module by name
     * @param {string} moduleName
     */
    getModule(moduleName) {
        return this.modules[moduleName];
    }

    /**
     * Get config by path
     * @param {undefined|string} path
     * @param {*} defaultValue
     * @returns {object}
     */
    getConfig(path, defaultValue) {
        if (!path) {
            return Application.config;
        } else {
            return mpath.get(path, Application.config) || defaultValue;
        }
    }

    /**
     *
     * @param name
     * @return {{warn: warn, Colors: {FgYellow: string, BgGreen: string, BgCyan: string, Reverse: string, FgBlue: string, Blink: string, Dim: string, BgBlack: string, BgYellow: string, Bright: string, FgBlack: string, BgBlue: string, FgGreen: string, FgMagenta: string, Hidden: string, Underscore: string, FgRed: string, FgCyan: string, FgWhite: string, BgMagenta: string, Reset: string, BgWhite: string, BgRed: string}, error: error, info: info}}
     */
    getLogger(name) {
        name = name.toUpperCase();
        return {
            Colors: Colors,
            /**
             * Log information
             */
            info: function () {
                const msg = [Colors.BgWhite + "[INFO]" + Colors.Reset, name, ...arguments]
                    .map(String)
                    .join(" ");
                console.log(msg);
            },
            /**
             * Log warning
             */
            warn: function () {
                const msg = [Colors.BgWhite + "[WARN]" + Colors.Reset, name, ...arguments]
                    .map(String)
                    .join(" ");
                console.warn(msg);
            },
            /**
             * Log error
             */
            error: function () {
                const msg = [Colors.BgWhite + "[ERROR]" + Colors.Reset, name, ...arguments]
                    .map(String)
                    .join(" ");
                console.error(msg);
            }
        }
    }
}

module.exports = new Application();