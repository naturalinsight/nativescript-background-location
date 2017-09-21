const application = require("application");
const permissions = require( "nativescript-permissions" );

const GoogleApiClient = com.google.android.gms.common.api.GoogleApiClient;
const LocationServices = com.google.android.gms.location.LocationServices;
const LocationRequest = com.google.android.gms.location.LocationRequest;
const LocationResult = com.google.android.gms.location.LocationResult;
const PendingIntent = android.app.PendingIntent;

const BackgroundLocationBase = require("./backgroundLocation.common");

var instance;

class BackgroundLocation extends BackgroundLocationBase {
	constructor() {
		super();
	}

	static getInstance(config) {
		if (!instance) {
			instance = new BackgroundLocation();
		}

		instance.setConfig(config);
		return instance;
	}

	static convertLocation(androidLocation) {
		return {
			latitude: androidLocation.getLatitude(),
			longitude: androidLocation.getLongitude(),
			altitude: androidLocation.getAltitude(),
			accuracy: {
				horizontal: androidLocation.getAccuracy(),
				vertical: androidLocation.getAccuracy()
			},
			speed: androidLocation.getSpeed(),
			direction: androidLocation.getBearing(),
			timestamp: new Date(androidLocation.getTime()),
			android: androidLocation
		};
	}

	static extractLocation(intent) {
		if (LocationResult.hasResult(intent)) {
			const loc = LocationResult.extractResult(intent).getLastLocation();

			return BackgroundLocation.convertLocation(loc);
		}

		return;
	}

	static hasPermission() {
		return permissions.hasPermission(android.Manifest.permission.ACCESS_FINE_LOCATION);
	}

	static requestPermission(reason) {
		if (!reason) {
			reason = "Required to track your location in background";
		}

		return permissions.requestPermission(android.Manifest.permission.ACCESS_FINE_LOCATION);
	}

	connectToGooleAPI() {
		return new Promise(function (resolve, reject) {
			let api = new GoogleApiClient.Builder(application.android.context)
			.addConnectionCallbacks(new GoogleApiClient.ConnectionCallbacks({
				onConnected: function () {
					resolve(api);
				}
			}))
			.addOnConnectionFailedListener(new GoogleApiClient.OnConnectionFailedListener({
				onConnectionFailed: function() {
					reject(new Error("Google API connection failed"));
				}
			}))
			.addApi(LocationServices.API)
			.build();

			api.connect();
		}.bind(this));
	}

	setHandler(classRef) {
		var context = application.android.context;
		var intent = new android.content.Intent(context, classRef.class);
		this.intent = PendingIntent.getService(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
	}

	start() {
		BackgroundLocation.requestPermission()
			.then(function () {
				this.connectToGooleAPI()
					.then(function (api) {
						const locationRequest = new LocationRequest();
						locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
						locationRequest.setFastestInterval(this.config.interval);
						locationRequest.setInterval(this.config.interval);

						LocationServices.FusedLocationApi.requestLocationUpdates(api, locationRequest, this.intent);
						api.disconnect();
					}.bind(this))
					.catch(function (err) {
						console.error(err.stack);
					});
			}.bind(this))
			.catch(function (err) {
				console.error(err.stack);
			});
	}

	stop() {
		this.connectToGooleAPI()
		.then(function (api) {
			LocationServices.FusedLocationApi.removeLocationUpdates (api, this.intent);
			api.disconnect();
		}.bind(this))
		.catch(function (err) {
			console.error(err.stack);
		});
	}

	getLocation() {
		return BackgroundLocation.requestPermission()
		.then(function () {
			return this.connectToGooleAPI()
			.then(function (api) {
				const loc = LocationServices.FusedLocationApi.getLastLocation(api);
				return BackgroundLocation.convertLocation(loc);
			});
		}.bind(this));

	}
}

module.exports = BackgroundLocation;
