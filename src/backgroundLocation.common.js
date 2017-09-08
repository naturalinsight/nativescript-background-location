const {extend} = require("./utils");

class BackgroundLocationBase {
	constructor() {
		this.defaultConfig = {
			interval: 5000
		};
	}

	setConfig(config) {
		this.config = extend({}, this.defaultConfig, config || {});
	}
}

module.exports = BackgroundLocationBase;
