var push = {};

push.initPushwoosh = function () {
    if (device.platform == "Android") {
        registerPushwooshAndroid();
    }
    if (device.platform == "iPhone" || device.platform == "iOS") {
        registerPushwooshIOS();
    }
}

function registerPushwooshAndroid() {
    var pushNotification = window.plugins.pushNotification;
    //set push notifications handler
    document.addEventListener('push-notification',
            function (event)
            {
                var title = event.notification.title;
                var userData = event.notification.userdata;
                //dump custom data to the console if it exists
                if (typeof (userData) != "undefined") {
                    console.warn('user data: ' + JSON.stringify(userData));
                }
                //and show alert
                alert(title);
                //stopping geopushes
                //pushNotification.stopGeoPushes();
            }
    );

    //initialize Pushwoosh with projectid: "GOOGLE_PROJECT_ID", appid : "PUSHWOOSH_APP_ID".
    //This will trigger all pending push notifications on start.
    pushNotification.onDeviceReady({projectid: "1098796262059", appid: "DA80A-458BB"});

    //register for push notifications
    pushNotification.registerDevice(
            function (token)
            {
                //callback when pushwoosh is ready
                onPushwooshAndroidInitialized(token);
            },
            function (status)
            {
                alert("failed to register: " + status);
                console.warn(JSON.stringify(['failed to register ', status]));
            }
    );
}

function onPushwooshAndroidInitialized(pushToken) {
    //output the token to the console
    console.warn('push token: ' + pushToken);
    var pushNotification = window.plugins.pushNotification;
    //if you need push token at a later time you can always get it from Pushwoosh plugin
    pushNotification.getPushToken(
            function (token)
            {
                console.warn('push token: ' + token);
            }
    );
    //and HWID if you want to communicate with Pushwoosh API
    pushNotification.getPushwooshHWID(
            function (token) {
                console.warn('Pushwoosh HWID: ' + token);
            }
    );
    pushNotification.getTags(
            function (tags)
            {
                console.warn('tags for the device: ' + JSON.stringify(tags));
            },
            function (error)
            {
                console.warn('get tags error: ' + JSON.stringify(error));
            }
    );
    //set multi notificaiton mode
    //pushNotification.setMultiNotificationMode();
    //pushNotification.setEnableLED(true);
    //set single notification mode
    //pushNotification.setSingleNotificationMode();
    //disable sound and vibration
    //pushNotification.setSoundType(1);
    //pushNotification.setVibrateType(1);
    pushNotification.setLightScreenOnNotification(false);
    //goal with count
    //pushNotification.sendGoalAchieved({goal:'purchase', count:3});
    //goal with no count
    //pushNotification.sendGoalAchieved({goal:'registration'});
    //setting list tags
    //pushNotification.setTags({"MyTag":["hello", "world"]});
    //settings tags
    pushNotification.setTags({deviceName: "hello", deviceId: 10},
    function (status) {
        console.warn('setTags success');
    },
            function (status) {
                console.warn('setTags failed');
            }
    );
    //Pushwoosh Android specific method that cares for the battery
    //pushNotification.startGeoPushes();
}

function registerPushwooshIOS() {
    var pushNotification = window.plugins.pushNotification;
    //set push notification callback before we initialize the plugin
    document.addEventListener('push-notification',
            function (event)
            {
                //get the notification payload
                var notification = event.notification;
                //display alert to the user for example
                alert(notification.aps.alert);
                //to view full push payload
                //alert(JSON.stringify(notification));
                //clear the app badge
                pushNotification.setApplicationIconBadgeNumber(0);
            }
    );
    //initialize the plugin
    pushNotification.onDeviceReady({pw_appid: "DA80A-458BB"});
    //register for pushes
    pushNotification.registerDevice(
            function (status)
            {
                var deviceToken = status['deviceToken'];
                console.warn('registerDevice: ' + deviceToken);
                onPushwooshiOSInitialized(deviceToken);
            },
            function (status)
            {
                console.warn('failed to register : ' + JSON.stringify(status));
                //alert(JSON.stringify(['failed to register ', status]));
            }
    );
    //reset badges on start
    pushNotification.setApplicationIconBadgeNumber(0);
}

function onPushwooshiOSInitialized(pushToken) {
    var pushNotification = window.plugins.pushNotification;
    //retrieve the tags for the device
    pushNotification.getTags(
            function (tags) {
                console.warn('tags for the device: ' + JSON.stringify(tags));
            },
            function (error) {
                console.warn('get tags error: ' + JSON.stringify(error));
            }
    );
    //example how to get push token at a later time
    pushNotification.getPushToken(
            function (token)
            {
                console.warn('push token device: ' + token);
            }
    );
    //example how to get Pushwoosh HWID to communicate with Pushwoosh API
    pushNotification.getPushwooshHWID(
            function (token) {
                console.warn('Pushwoosh HWID: ' + token);
            }
    );
    //start geo tracking.
    //pushNotification.startLocationTracking();
}