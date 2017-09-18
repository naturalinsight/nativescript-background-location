/* globals CLLocationManager, UIApplicationWillResignActiveNotification, UIApplicationDidBecomeActiveNotification
           NSDate, kCLLocationAccuracyBest, CLActivityTypeAutomotiveNavigation */

const app = require("application");

const BackgroundLocationBase = require("./backgroundLocation.common");
const {extend} = require("./utils");

var instance;

class BackgroundLocation extends BackgroundLocationBase {
	constructor() {
		super();

		this.running = false;
		this.inBackground = false;

		this.locationManager = new CLLocationManager();
		this.locationManager.desiredAccuracy = kCLLocationAccuracyBest;
		this.locationManager.pausesLocationUpdatesAutomatically = false;
		this.locationManager.allowsBackgroundLocationUpdates = true;
		this.locationManager.requestAlwaysAuthorization();

		app.ios.addNotificationObserver(UIApplicationWillResignActiveNotification, this.appEnteredBackground.bind(this));
		app.ios.addNotificationObserver(UIApplicationDidBecomeActiveNotification, this.appEnteredForeground.bind(this));
	}

	static getInstance(config) {
		if (!instance) {
			instance = new BackgroundLocation();
		}

		instance.config = extend({}, instance.defaultConfig, config || {});
		return instance;
	}

	static hasPermission() {
		return true;
	}

	static extractLocation(locations) {
		const loc = locations.lastObject;

		const unixtime = NSDate.dateWithTimeIntervalSinceDate(0, loc.timestamp).timeIntervalSince1970 * 1000;

		return {
			latitude: loc.coordinate.latitude,
			longitude: loc.coordinate.longitude,
			altitude: loc.altitude,
			accuracy: {
				horizontal: loc.horizontalAccuracy,
				vertical: loc.verticalAccuracy
			},
			speed: loc.speed,
			direction: loc.course,
			timestamp: new Date(unixtime),
			ios: loc
		};
	}

	setHandler(locationDelegate) {
		this.locationManager.delegate = locationDelegate;
	}

	start() {
		this.running = true;
		this.locationManager.startUpdatingLocation();
	}

	stop() {
		this.running = false;
		this.locationManager.stopUpdatingLocation();
	}

	requestLocation() {
		console.log("REQ !!!");
		this.locationManager.requestLocation();
	}

	appEnteredBackground() {
		this.inBackground = true;
		this.locationManager.pausesLocationUpdatesAutomatically = false;

		if (this.running) {
			this.stop();
			this.start();
		}
	}

	appEnteredForeground() {
		this.inBackground = false;
		this.locationManager.pausesLocationUpdatesAutomatically = true;

		if (this.running) {
			this.stop();
			this.start();
		}
	}
}

module.exports = BackgroundLocation;
