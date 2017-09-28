const {extend} = require("./utils");
const {TIME} = require("./const");

const ACCURACY = {
	HIGH: 3,
	MEDIUM: 100,
	LOW: 1000
};

class BackgroundLocationBase {
	constructor() {
		this.defaultConfig = {
			desiredAccuracy: ACCURACY.LOW,
			updateDistance: 0,

			//Android
			updateInterval: 5 * TIME.SECONDS,
			fasterUpdates: true,
			slowerUpdates: false
		};
	}

	setConfig(config) {
		this.config = extend({}, this.defaultConfig, config || {});
	}
}

BackgroundLocationBase.ACCURACY = ACCURACY;

module.exports = BackgroundLocationBase;
