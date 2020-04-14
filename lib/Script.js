class Script {
    app = null;

    constructor(app) {
        this.app = app;
    }

    async run() {
        throw new Error('override run()!');
    }
}

module.exports = Script;
