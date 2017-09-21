const {extend} = require("./utils");

class BackgroundLocationBase {
	constructor() {
		this.defaultConfig = {
			interval: 5000,
			distanceFilter: 0 //TODO: implement me
		};
	}

	setConfig(config) {
		this.config = extend({}, this.defaultConfig, config || {});
	}
}

module.exports = BackgroundLocationBase;
