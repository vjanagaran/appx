/**
 * Global config file to load server / application settings and constants 
 */

config = function () {
    'use strict';
    return {
        apiRoot: "http://www.jayam.co.uk/uravu/v1/",
        fbAppId: "862541893776729",
        nodeJs: 'http://www.jayam.co.uk:3000/',
        user_id: "uravu_user_id",
        user_name: "uravu_user_name",
        user_email: "uravu_user_email",
        user_session: "uravu_session_id",
        user_user: "uravu_user_image",
        user_config: "uravu_user_config",
        user_config_default: "uravu_user_default_config",
        filter_config: "uravu_filter_config",
        language: "uravu_language",
        db_name: "uravu_database",
        db_version: "1.0",
        showlog: 3 // 0: "Disabled", 1: "Error", 2: "Warning", 3: "Info"
    };
}();

var user_config_default = {
    language: "tamil",
    distance: 10,
    tags: "",
    sortby: "distance"
}

function getFilterConfig() {
    var conf = window.localStorage.getItem(config.filter_config);
    return conf;
}

function setFilterConfig() {
    var flag = 0;
    var distance = $("#slider").slider("value");
    var tags = $('#filter_tags').val();
    if ($("#flag").prop('checked') == true) {
        flag = 1;
    }
    var filter = {
        distance: distance,
        tags: tags,
        flag: flag
    }
    filter = JSON.stringify(filter);
    alert(filter);
    window.localStorage.setItem(config.filter_config, filter);
}