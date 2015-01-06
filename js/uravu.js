"use strict";
var is_mobile = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
var watchID, geoLoc, lastLoc = {lat: 0, lng: 0};
if (is_mobile) {
    document.addEventListener("deviceready", onDeviceReady, false);
    document.addEventListener("touchstart", function () {
    }, false);
} else {
    onDeviceReady();
}

function onDeviceReady() {
    if (navigator.geolocation) {
        var options = {maximumAge: 10000, timeout: 60000, enableHighAccuracy: false};
        watchID = navigator.geolocation.watchPosition(updateLocation, errorHandler, options);
    } else {
        log("Sorry, browser does not support geolocation!", 1);
    }
    localDb.init();
    openFB.init({appId: config.fbAppId});
    //initPushwoosh();
}

var router = new $.mobile.Router([{
        "#home": {handler: "homePage", events: "bs"},
        "#register": {handler: "registerPage", events: "bs"},
        "#login": {handler: "loginPage", events: "bs"},
        "#forgotpass": {handler: "forgotpassPage", events: "bs"},
        "#reg_avatar": {handler: "regavatarPage", events: "bs"},
        "#nearby(?:[?/](.*))?": {handler: "nearbyPage", events: "bs"},
        "#favorite": {handler: "favoritePage", events: "bs"},
        "#block": {handler: "blockPage", events: "bs"},
        "#filter": {handler: "filterPage", events: "bs"},
        "#sort": {handler: "sortPage", events: "bs"},
        "#chat(?:[?/](.*))?": {handler: "chatPage", events: "bs"},
        "#user(?:[?/](.*))?": {handler: "userPage", events: "bs"},
        "#more": {handler: "morePage", events: "bs"},
        "#profile": {handler: "profilePage", events: "bs"},
        "#setting": {handler: "settingPage", events: "bs"},
        "#language": {handler: "languagePage", events: "bs"},
        "#avatar": {handler: "avatarPage", events: "bs"},
        "#change_password": {handler: "changepassPage", events: "bs"},
        "#about": {handler: "aboutPage", events: "bs"}
    }], {
    homePage: function (type, match, ui) {
        log('Home Page', 3);
        home();
    },
    registerPage: function (type, match, ui) {
        log('Register Page', 3);
        refreshRegister();
    },
    loginPage: function (type, match, ui) {
        log('Login Page', 3);
        dotrans();
    },
    forgotpassPage: function (type, match, ui) {
        log('Forgotpassword Page', 3);
        refreshforgotpass();
    },
    regavatarPage: function (type, match, ui) {
        log('RegisterAvatar Page ', 3);
        dotrans();
    },
    nearbyPage: function (type, match, ui) {
        log("Search page", 3);
        var qry = "";
        if (router.getParams(match[1]) !== null && router.getParams(match[1]) !== "") {
            var params = router.getParams(match[1]);
            qry = params.qry;
        }
        nearby(qry);
    },
    favoritePage: function (type, match, ui) {
        log("Favorite page", 3);
        showFavorite();
    },
    blockPage: function (type, match, ui) {
        log("Blocked page", 3);
        showBlock();
    },
    filterPage: function (type, match, ui) {
        log("Filter page", 3);
        showFilter();
    },
    sortPage: function (type, match, ui) {
        log("Sort page", 3);
        showSort();
    },
    chatPage: function (type, match, ui) {
        log("Chat page", 3);
        var to = "";
        if (router.getParams(match[1]) !== null && router.getParams(match[1]) !== "") {
            to = router.getParams(match[1]).to;
        }
        showChat(to);
    },
    userPage: function (type, match, ui) {
        log("User page", 3);
        var params = router.getParams(match[1]);
        userDetails(params.id);
    },
    morePage: function (type, match, ui) {
        log("More page", 3);
        //dotrans();
    },
    profilePage: function (type, match, ui) {
        log("Profile page", 3);
        showProfile();
        dotrans();
    },
    settingPage: function (type, match, ui) {
        log('Setting page', 3);
        dotrans();
        showSelected();
    },
    languagePage: function (type, match, ui) {
        log('Language Page', 3);
        checkLang();
        dotrans();
    },
    avatarPage: function (type, match, ui) {
        log('Avatar Page', 3);
        dotrans();
    },
    changepassPage: function (type, match, ui) {
        log('Changepassword Page', 3);
        refreshchangepass();
    },
    aboutPage: function (type, match, ui) {
        log('About Page', 3);
        dotrans();
    }
}, {
    ajaxApp: true,
    defaultHandler: function (type, ui, page) {
        log("Default handler called due to unknown route (" + type + ", " + ui + ", " + page + ")", 1);
    },
    defaultHandlerEvents: "s",
    defaultArgsRe: true
});
$.addTemplateFormatter({
    DateFormat: function (value, template) {
        if (template === "verylong") {
            return $.format.date(value, "ddd, dd/MM/yyyy HH:mm");
        } else if (template === "long") {
            return $.format.date(value, "dd/MM/yyyy HH:mm");
        } else {
            return $.format.date(value, "dd/MM/yyyy");
        }
    },
    userId: function (value, options) {
        return "user_" + value;
    },
    userHref: function (value, options) {
        return "#user?id=" + value;
    },
    favoriteHref: function (value, options) {
        alert(value);
    },
    chatHref: function (value, options) {
        return "#chat?to=" + value;
    },
    chatBtn: function (value, options) {
        return "btn_" + mail2id(value);
    },
    chatLabel: function (value, options) {
        var lb;
        if (value > 0) {
            lb = "<i class=\"fa fa-comment newmsg\"></i><sup>" + value + "</sup>";
        } else {
            lb = "<i class=\"fa fa-comment\"></i>";
        }
        return lb;
    },
    userTitle: function (value, options) {
        return value;
    },
    userTags: function (value, options) {
        var tags = value.split(",");
        var filter = getFilterConfig();
        var rs = $.parseJSON(filter);
        var selected = rs.tags.split(",");
        var out = "";
        var out1 = "";
        var out2 = "";
        $.each(tags, function (index, tag) {
            tag = $.trim(tag);
            $.each(selected, function (ind, sel) {
                sel = $.trim(sel);
                if (sel == tag) {
                    out1 = out1 + '<li class="tags_selected">' + tag + '</li>';
                } else {
                    out2 = out2 + '<li>' + tag + '</li>';
                }
            });
        });
        out = out1 + out2;
        //console.log(out);
        return out;
    },
    distanceFormat: function (value, options) {
        var miles2km = 1.60934;
        var km = value * miles2km;
        if (km > 1) {
            return parseFloat(km).toFixed(2) + " Km";
        } else {
            return parseFloat(km * 1000).toFixed(0) + " m";
        }
    }
});

function updateLocation(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    if (lastLoc.lat !== lat || lastLoc.lng !== lng) {
        log("New location updated : " + lat + ", " + lng, 3);
        if (getVal(config.user_session)) {
            var uid = getVal(config.user_id);
            var data = {lat: lat, lng: lng};
            var api = new $.RestClient();
            api.add('loc', {url: 'loc/' + uid});
            var loc = api.loc.update(data);
            loc.done(function (rs) {
                lastLoc.lat = lat;
                lastLoc.lng = lng;
                log("Updated location", 3);
            });
        }
    } else {
        // log('No change in location', 3);
    }
}

function errorHandler(err) {
    log("\nCode: " + err.code + "\nMsg: " + err.message, 1);
}

/* General functions
 * -------------------------------------------------------------------
 */
function log(msg, level) {
    if (typeof (level) === "undefined") {
        level = 3;
    }
    var logname = {0: "Disabled", 1: "Error", 2: "Warning", 3: "Info"};
    if (level <= config.showlog) {
        console.log(logname[level] + ": " + msg);
    }
}

function mail2id(email) {
    var id = email.toLowerCase();
    id = id.replace(/\@/g, "_");
    id = id.replace(/\./g, "_");
    return id;
}

function home() {
    dotrans();
    var apiKey = getVal(config.user_session);
    if (apiKey && apiKey !== "") {
        log("apiKey exists " + apiKey, 3);
        chat.signin();
        $(":mobile-pagecontainer").pagecontainer("change", "#nearby");
    }
}

function fblogin() {
    openFB.login(
            function (response) {
                if (response.status === 'connected') {
                    log('Facebook login succeeded, got access token: ' + response.authResponse.token, 3);
                    openFB.api({
                        path: '/me',
                        success: function (data) {
                            log('FB Login with ' + data.email, 3);
                            var api = new $.RestClient();
                            var val = {email: data.email, name: data.name, fb_auth: data.id, about: data.bio};
                            api.add('fb', {url: 'fblogin'});
                            var fb = api.fb.create(val);
                            fb.done(function (rs) {
                                if (rs.error === false) {
                                    setVal(config.user_id, rs.id);
                                    setVal(config.user_email, rs.email);
                                    setVal(config.user_session, rs.apiKey);
                                    chat.signin();
                                    localDb.syncUsers("");
                                    $(":mobile-pagecontainer").pagecontainer("change", "#nearby");
                                } else {
                                    alert(rs.message);
                                }
                            })
                        },
                        error: errorHandler});
                } else {
                    log('Facebook login failed: ' + response.error, 1);
                }
            }, {scope: 'email,read_stream,publish_stream'});
}

function emaillogin() {
    var email = $("#lemail").val();
    var pass = $("#lpassword").val();
    if (!validateEmail(email)) {
        alert("Please enter valid email");
        $("#lemail").focus();
        return false;
    }
    if (pass.length < 1) {
        alert("Please enter password");
        $("#lpassword").focus();
        return false;
    }
    login(email, pass);
    return false;
}

function login(email, pass) {
    var api = new $.RestClient();
    api.add('user', {url: 'login'});
    var user = api.user.create({email: email, password: pass});
    user.done(function (rs) {
        if (rs.error === false) {
            setVal(config.user_id, rs.id);
            setVal(config.user_email, rs.email);
            setVal(config.user_name, rs.name);
            setVal(config.user_session, rs.apiKey);
            setVal(config.user_image, rs.image);
            chat.signin();
            localDb.syncUsers("");
            $("#errLogin").empty();
            $(":mobile-pagecontainer").pagecontainer("change", "#nearby");
        } else {
            log('Login error', 3);
            $("#errLogin").html(rs.message);
        }
    });
}

function refreshforgotpass() {
    $("#errForgotpass").empty();
    $("#femail").val("");
}

function refreshchangepass() {
    $("#errChangepass").empty();
}

function getInfo() {
    openFB.api({
        path: '/me',
        success: function (data) {
            console.log(JSON.stringify(data));
        },
        error: errorHandler});
}

function share() {
    openFB.api({
        method: 'POST',
        path: '/me/feed',
        params: {
            message: 'Hey! I installed Uravu App'
        },
        success: function () {
            alert('the item was posted on Facebook');
        },
        error: errorHandler});
}

function logout() {
    removeVal(config.user_id);
    removeVal(config.user_email);
    removeVal(config.user_name);
    removeVal(config.user_session);
    removeVal(config.user_image);
    log('Logged out', 3);
    $(":mobile-pagecontainer").pagecontainer("change", "#home");
}

function showSort() {
    dotrans();
}

function refreshRegister() {
    $('#reg_name').val('');
    $('#reg_mobile').val('');
    $('#reg_about').val('');
    $('#reg_tags').val('');
    dotrans();
}

function saveRegister() {
    if (validateRegistrer()) {
        var name = $("#reg_name").val(),
                email = $("#reg_email").val(),
                password = $("#reg_password").val(),
                about = $("#reg_about").val(),
                mobile = $("#reg_mobile").val(),
                tags = $("#reg_tags").val();
        var data = {name: name, email: email, password: password, about: about, mobile: mobile, tags: tags};
        var api = new $.RestClient();
        api.add('reg', {url: 'register'});
        var reg = api.reg.create(data);
        reg.done(function (rs) {
            if (rs.error === false) {
                setVal(config.user_id, rs.id);
                setVal(config.user_email, email);
                setVal(config.user_session, rs.apiKey);
                $("#errReg").empty();
                $(":mobile-pagecontainer").pagecontainer("change", "#reg_avatar");
            } else {
                log('User alredy exist', 3);
                $("#errReg").html(rs.message);
            }
        });
    }
    return false;
}

function forgotpass() {
    $("#errForgotpass").empty();
    var email = $('#femail').val();
    if (validateEmail(email)) {
        var data = {email: email};
        var api = new $.RestClient();
        api.add('reset', {url: 'resetpassword'});
        var reset = api.reset.create(data);
        reset.done(function (rs) {
            if (rs.error === false) {
                $("#errForgotpass").html(rs.message);
            }
        });
    }
    return false;
}

function changepass() {
    $("#errChangepass").empty();
    var pas = $('#npass').val();
    if (validPassword()) {
        var api = new $.RestClient();
        var data = {password: pas};
        api.add('changepass', {url: 'changepass/' + getVal(config.user_id), apiKey: getVal(config.user_session)});
        var changepass = api.changepass.create(data);
        changepass.done(function (rs) {
            if (rs.error === false) {
                $("#errChangepass").html(rs.message);
            }
        });
    }
    return false;
}

function validPassword() {
    if ($.trim($("#npass").val()).length < 6) {
        alert("Password must be 6 char");
        return false;
    }
    if ($.trim($("#re_npass").val()) !== $.trim($("#npass").val())) {
        alert("Re-entered password missmatched!");
        return false;
    }
    return true;
}

function validateRegistrer() {
    if ($.trim($("#reg_name").val()).length < 3) {
        alert("Name must be 3 char");
        return false;
    }
    if (!validateEmail(jQuery("#reg_email").val())) {
        alert("Please enter valid email");
        return false;
    }
    if ($.trim($("#reg_password").val()).length < 6) {
        alert("Password must be 6 char");
        return false;
    }
    if ($.trim($("#reg_password").val()) !== $.trim($("#reg_repassword").val())) {
        alert("Re-entered password missmatched!");
        return false;
    }
    if ($.trim($("#reg_about").val()).length < 15) {
        alert("Tell about you at least with 15 char");
        return false;
    }
    return true;
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function showProfile() {
    $("#update_msg").empty();
    if (getVal(config.user_session)) {
        var uid = getVal(config.user_id);
        var api = new $.RestClient();
        var email = getVal(config.user_email);
        api.add('user', {url: 'user/' + uid, apiKey: getVal(config.user_session)});
        var user = api.user.read();
        user.done(function (rs) {
            $("#pro-name").val(rs.user.name);
            $("#pro-email").val(rs.user.email);
            $("#pro-mobile").val(rs.user.mobile);
            $("#pro-about").val(rs.user.about);
            $("#pro-tags").importTags(rs.user.tags);
        });
    }
}

function saveProfile() {
    $("#update_msg").empty();
    if (validateProfile()) {
        var name = $("#pro-name").val();
        var mobile = $("#pro-mobile").val();
        var about = $("#pro-about").val();
        var tags = $("#pro-tags").val();
        var api = new $.RestClient();
        var data = {name: name, about: about, mobile: mobile, tags: tags};
        api.add('update', {url: 'user/' + getVal(config.user_id), apiKey: getVal(config.user_session)});
        var update = api.update.create(data);
        update.done(function (rs) {
            if (rs.error === false) {
                log('Profile updated', 2);
                showProfile();
                $("#update_msg").html(rs.message);
            }
        });
    }
}

function getImage() {
    navigator.camera.getPicture(uploadPhoto,
            function (message) {
                alert('get picture failed');
            },
            {quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY}
    );
}

function uploadPhoto(imageURI) {
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1) + '.png';
    options.mimeType = "text/plain";
    var params = new Object();
    options.params = params;
    var ft = new FileTransfer();
    ft.upload(imageURI, encodeURI("http://www.jayam.co.uk/uravu/v1/avatar/16"), win, fail, options);
}


function win(r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    alert(r.response);
}

function fail(error) {
    alert("An error has occurred: Code = " + error.code);
}

function saveRegAvatar(frm) {
    var img = $("#reg-avatar-image").val();
    $('#regavatar_msg').empty();
    if (img !== '') {
        $("#regavatar_msg").append('please wait...');
        var data = new FormData(frm);
        var uid = getVal(config.user_id);
        var api = new $.RestClient();
        api.add('avatar', {url: 'avatar/' + uid, apiKey: getVal(config.user_session), multipart: true});
        var avatar = api.avatar.create(data);
        avatar.done(function (rs) {
            if (rs.error == false) {
                $('#regavatar_msg').empty();
                $(":mobile-pagecontainer").pagecontainer("change", "#nearby");
            } else {
                $('#regavatar_msg').empty();
                $('#regavatar_msg').append(rs.message);
            }
        });
    }
    return false;
}

function uploadAvatar(frm) {
    var img = $("#avatar-image").val();
    $("#done_msg").empty();
    if (img !== '') {
        $("#done_msg").append('please wait...');
        var data = new FormData(frm);
        var uid = getVal(config.user_id);
        var api = new $.RestClient();
        api.add('avatar', {url: 'avatar/' + uid, apiKey: getVal(config.user_session), multipart: true});
        var avatar = api.avatar.create(data);
        avatar.done(function (rs) {
            if (rs.error == false) {
                console.log('done');
                $("#done_msg").empty();
                $('#done_msg').append(rs.message);
            } else {
                $("#done_msg").empty();
                $("#done_msg").append(rs.message);
            }
        });
    }
    return false;
}

function validateProfile() {
    if ($.trim($("#pro-name").val()).length < 3) {
        alert("Name must be 3 char");
        return false;
    }
    if ($.trim($("#pro-about").val()).length < 15) {
        alert("Tell about you at least with 15 char");
        return false;
    }
    return true;
}

function nearby(qry) {
    if (getVal(config.user_session)) {
        qry = $.trim(qry);
        localDb.getUsers(qry);
    }
    dotrans();
    setSort();
    return false;
}

function showFavorite() {
    if (getVal(config.user_session)) {
        localDb.getFavoriteUsers();
    }
    dotrans();
    return false;
}

function showBlock() {
    if (getVal(config.user_session)) {
        localDb.getBlockedUsers();
    }
    dotrans();
    return false;
}

function submitSearch() {
    var qry = $("#query").val();
    qry = $.trim(qry);
    if (qry.length < 4) {
        alert("please enter at leaset 4 char");
    } else {
        search(qry);
    }
    return false;
}

function userDetails(uid) {
    if (uid !== "") {
        localDb.getUserById(uid);
    }
    dotrans();
}

function favoriteUser(elm) {
    $('#successmsg').empty();
    if (elm !== "") {
        var uid = elm.dataset.userId;
        var api = new $.RestClient();
        api.add('favorite', {url: 'favorite/' + uid, apiKey: getVal(config.user_session)});
        var favorite = api.favorite.create();
        favorite.done(function (rs) {
            if (rs.error == false) {
                var status = rs.value;
                if (status == 0)
                {
                    $('#successmsg').append(rs.message);
                    $('#favorite_active').removeClass("ui-btn-active");
                } else {
                    $('#successmsg').append(rs.message);
                    $('#favorite_active').addClass("ui-btn-active");
                }
            } else {
                $('#successmsg').append(rs.message);
            }
            localDb.syncUsers("");
        });
    }
}

function blockUser(elm) {
    $('#successmsg').empty();
    if (elm !== "") {
        var uid = elm.dataset.userId;
        var api = new $.RestClient();
        api.add('block', {url: 'block/' + uid, apiKey: getVal(config.user_session)});
        var block = api.block.create();
        block.done(function (rs) {
            if (rs.error == false) {
                var status = rs.value;
                if (status == 0)
                {
                    $('#successmsg').append(rs.message);
                    $('#block_active').removeClass("ui-btn-active");
                } else {
                    $('#successmsg').append(rs.message);
                    $('#block_active').addClass("ui-btn-active");
                }
            } else {
                $('#successmsg').append(rs.message);
            }
            localDb.syncUsers("");
        });
    }
}

function showChat(to) {
    chat.signin();
    if (to === "") {
        alert("To email missing can't initiate chat");
        return false;
    }

    chat.currentWindow = to;
    $("#to").val(to);
    $("#messages").empty();
    $('#messages').height(window.innerHeight - chat.windowTolerance);
    // Build old messages
    localDb.getMessages(to);
    /*setInterval(function () {
     var elem = document.getElementById('messages');
     elem.scrollTop = elem.scrollHeight;
     alert('intervel is on');
     }, 100);*/

    dotrans();
    return true;
}

function showHelp() {
    var api = new $.RestClient();
    api.add('help', {url: 'help'});
    var help = api.help.read();
    help.done(function (rs) {
        $("#help_data").html(rs.data);
    });
}

function socialShare(social, url, ttl, desc) {
    var surl = webRoot + url;
    if (social == 'facebook') {
        var fullurl = "http://www.facebook.com/sharer/sharer.php?u=" + surl;
        window.open(fullurl, '', "toolbar=0,location=0,height=450,width=650");
    } else if (social == 'gplus') {
        var fullurl = "https://plus.google.com/share?url=" + surl;
        window.open(fullurl, '', "toolbar=0,location=0,height=450,width=550");
    } else if (social == 'twitter') {
        var fullurl = "https://twitter.com/share?original_referer=http://www.charing.com/&source=tweetbutton&text=" + ttl + "&url=" + surl;
        window.open(fullurl, '', "menubar=1,resizable=1,width=450,height=350");
    }
}

function setVal(key, value) {
    window.localStorage.setItem(key, value);
}

function getVal(key) {
    var value;
    value = window.localStorage.getItem(key);
    return  value;
}

function removeVal(key) {
    window.localStorage.removeItem(key);
}

function clearAll() {
    window.localStorage.clear();
}

function nl2br(str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function dotrans() {
    $(".trans").each(function (index, element) {
        var lb = element.dataset.label;
        var trans = _t(lb);
        element.innerHTML = trans;
    });
    $(".transph").each(function (index, element) {
        var lb = element.dataset.label;
        var trans = _t(lb);
        element.placeholder = trans;
    });
    $(".transv").each(function (index, element) {
        var lb = element.dataset.label;
        var trans = _t(lb);
        element.value = trans;
    });
    $(".transfix").each(function (index, element) {
        var lb = element.dataset.label;
        $.ajax({
            url: 'local/' + lb + '.json',
            dataType: 'json',
            async: false,
            success: function (rs) {
                element.innerHTML = rs[lb];
            }
        });
    });
}

var lang = [];
function _t(label) {
    var ln = getVal(config.language);
    var new_lbl = label;
    if (ln === null) {
        setVal(config.language, "english");
    }
    if (lang == "") {
        $.ajax({
            url: 'local/' + ln + '.json',
            dataType: 'json',
            async: false,
            success: function (rs) {
                lang = rs;
            }
        });
    }
    if (typeof (lang[label]) !== "undefined") {
        new_lbl = lang[label];
    }
    return new_lbl;
}

function checkLang() {
    var curr = getVal(config.language);
    if (curr == "tamil") {
        $("#langtl").attr("checked", "checked");
    } else if (curr == "english") {
        $("#langen").attr("checked", "checked");
    }
}

function selectLang(lan) {
    if (lan !== "") {
        var che = $("input[name='lang']:checked");
        var obj = che.val();
        setVal(config.language, obj);
        lang = "";
        dotrans();
        return false;
    }
    return true;
}

function showSelected() {
    $('.currLng').empty();
    var cur = getVal(config.language);
    $.ajax({
        url: 'local/' + cur + '.json',
        dataType: 'json',
        async: false,
        success: function (rs) {
            $('.currLng').append(rs[cur]);
        }
    });
}

function showFilter() {
    dotrans();
    var data = getFilterConfig();
    var rs = $.parseJSON(data);
    var chkbx = rs.flag;
    $("#slider").slider("value", rs.distance);
    $('#filter_tags').importTags(rs.tags);
    if (chkbx == 0) {
        $("#flag").prop('checked', false);
    } else {
        $("#flag").prop('checked', true);
    }
}