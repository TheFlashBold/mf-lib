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
    dirname = process.cwd();
    modules = {};
    config = {};
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
                this.config[fileName] = DeepMerge.all([this.config[fileName] || {}, configContent]);
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

        await Promise.map(Object.entries(this.modules), async ([, module]) => await module.postInit());
    }

    async stop() {
        await Promise.map(Object.entries(this.modules), async ([, module]) => await module.stop());
    }

    /**
     * @param {string} module
     * @param {object} moduleData
     */
    loadModule(module, moduleData) {
        if (!moduleData.module) {
            return;
        }

        this.modules[module] = new moduleData.module(this);
        if (moduleData.data) {
            this.modules[module].data = moduleData.data;
        }
        this.modules[module].name = module;
    }

    /**
     * Get module by name
     * @param {string} moduleName
     */
    getModule(moduleName) {
        return this.modules[moduleName];
    }

    /**
     *
     * @param name
     * @return {Promise<void>}
     */
    async runScript(name) {
        const scripts = Object.values(this.modules).map((module) => {
            if (module.data && module.data.scripts && module.data.scripts[name]) {
                return new module.data.scripts[name](this);
            }
        }).filter(script => !!script);
        await Promise.map(scripts, script => script.run);
    }

    /**
     * Get config by path
     * @param {undefined|string} path
     * @param {*} defaultValue
     * @returns {object}
     */
    getConfig(path, defaultValue) {
        if (!path) {
            return this.config;
        } else {
            return mpath.get(path, this.config) || defaultValue;
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
