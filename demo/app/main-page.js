const BackgroundLocation = require("nativescript-background-location");

com.pip3r4o.android.app.IntentService.extend("com.example.IntentService", {
	onHandleIntent: function (intent) {
		const location = BackgroundLocation.extractLocation(intent);
		if (location) {
			console.log("GOT LOCATION:", location.latitude, location.longitude);
		}
	}
});

function start() {
	const backgroundLocation = BackgroundLocation.getInstance();
	backgroundLocation.setHandler(com.example.IntentService);
	backgroundLocation.start();
}

function stop() {
	const backgroundLocation = BackgroundLocation.getInstance();
	backgroundLocation.setHandler(com.example.IntentService);
	backgroundLocation.stop();
}


module.exports = {
	start: start,
	stop: stop
};
