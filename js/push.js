var push = {};
push.pushNotification = null;
push.initPushwoosh = function () {
    push.pushNotification = window.plugins.pushNotification;

    if (device.platform == "Android") {
        registerPushwooshAndroid();
    }
    if (device.platform == "iPhone" || device.platform == "iOS") {
        registerPushwooshIOS();
    }
}

function registerPushwooshAndroid() {
    document.addEventListener('push-notification',
            function (event) {
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
            });

    push.pushNotification.onDeviceReady({projectid: "1098796262059", appid: "CD674-C9167"});

    push.pushNotification.registerDevice(
            function (token) {
                onPushwooshAndroidInitialized(token);
            },
            function (status) {
                alert("failed to register: " + status);
                console.warn(JSON.stringify(['failed to register ', status]));
            });
}

function onPushwooshAndroidInitialized(pushToken) {
    //if you need push token at a later time you can always get it from Pushwoosh plugin
    push.pushNotification.getPushToken(
            function (token) {
                socket.emit('pushToken', {
                                            email: getVal(config.user_email),
                                            pushToken: token
                                    });
                console.warn('push token: ' + token);
            });

    //and HWID if you want to communicate with Pushwoosh API
    push.pushNotification.getPushwooshHWID(
            function (token) {
                console.warn('Pushwoosh HWID: ' + token);
            });

    push.pushNotification.getTags(
            function (tags) {
                console.warn('tags for the device: ' + JSON.stringify(tags));
            },
            function (error) {
                console.warn('get tags error: ' + JSON.stringify(error));
            });
    //set multi notificaiton mode
    //pushNotification.setMultiNotificationMode();
    //pushNotification.setEnableLED(true);
    //set single notification mode
    //pushNotification.setSingleNotificationMode();
    //disable sound and vibration
    //pushNotification.setSoundType(1);
    //pushNotification.setVibrateType(1);
    push.pushNotification.setLightScreenOnNotification(false);
    //goal with count
    //pushNotification.sendGoalAchieved({goal:'purchase', count:3});
    //goal with no count
    //pushNotification.sendGoalAchieved({goal:'registration'});
    //setting list tags
    //pushNotification.setTags({"MyTag":["hello", "world"]});
    //settings tags
    push.pushNotification.setTags({deviceName: "hello", deviceId: 10},
    function (status) {
        console.warn('setTags success');
    },
            function (status) {
                console.warn('setTags failed');
            });
    //Pushwoosh Android specific method that cares for the battery
    //pushNotification.startGeoPushes();
}

function registerPushwooshIOS() {
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
                push.pushNotification.setApplicationIconBadgeNumber(0);
            });

    //initialize the plugin
    push.pushNotification.onDeviceReady({pw_appid: "CD674-C9167"});

    //register for pushes
    push.pushNotification.registerDevice(
            function (status) {
                var deviceToken = status['deviceToken'];
                console.warn('registerDevice: ' + deviceToken);
                onPushwooshiOSInitialized(deviceToken);
            },
            function (status) {
                console.warn('failed to register : ' + JSON.stringify(status));
                //alert(JSON.stringify(['failed to register ', status]));
            });
    //reset badges on start
    push.pushNotification.setApplicationIconBadgeNumber(0);
}

function onPushwooshiOSInitialized(pushToken) {
    push.pushNotification = window.plugins.pushNotification;
    //retrieve the tags for the device
    push.pushNotification.getTags(
            function (tags) {
                console.warn('tags for the device: ' + JSON.stringify(tags));
            },
            function (error) {
                console.warn('get tags error: ' + JSON.stringify(error));
            });

    //example how to get push token at a later time
    push.pushNotification.getPushToken(function (token) {
        socket.emit('pushToken', {
                                    email: getVal(config.user_email),
                                    pushToken: token
                            });
        console.warn('push token device: ' + token);
    });

    //example how to get Pushwoosh HWID to communicate with Pushwoosh API
    push.pushNotification.getPushwooshHWID(
            function (token) {
                console.warn('Pushwoosh HWID: ' + token);
            }
    );
    //start geo tracking.
    //pushNotification.startLocationTracking();
}