const application = require("application");
const permissions = require( "nativescript-permissions" );

const GoogleApiClient = com.google.android.gms.common.api.GoogleApiClient;
const LocationServices = com.google.android.gms.location.LocationServices;
const LocationRequest = com.google.android.gms.location.LocationRequest;
const LocationResult = com.google.android.gms.location.LocationResult;

const BackgroundLocationBase = require("./index.common");

var instance;

class BackgroundLocation extends BackgroundLocationBase {
	constructor() {
		super();

		this.config = {
			interval: 5000,
		};
	}

	static getInstance() {
		if (!instance) {
			instance = new BackgroundLocation();
		}

		return instance;
	}

	static extractLocation(intent) {
		if (LocationResult.hasResult(intent)) {
			const loc = LocationResult.extractResult(intent).getLastLocation();

			return {
				lat: loc.getLatitude(),
				lon: loc.getLongitude()
			};
		}

		return;
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
		this.intent = android.app.PendingIntent.getService(context, 0, intent, android.app.PendingIntent.FLAG_UPDATE_CURRENT);
	}

	start() {
		const reason = "Required to track your location in background";
		permissions.requestPermission(android.Manifest.permission.ACCESS_FINE_LOCATION, reason)
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
}

module.exports = BackgroundLocation;
