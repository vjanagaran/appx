var socket = io(config.nodeJs);

socket.on('connect', function (msg) {
    log("WebSocket connected", 3);
});
socket.on('chat message', function (msg) {
    chat.message(msg);
});

socket.on('chat_message_status_change', function (msg) {
    localDb.changeMessageStatus(msg);
});

/* Chat functions *************************/

var chat = {};

chat.currentWindow = null;
chat.windowTolerance = 150;

chat.init = function () {
};

chat.message = function (msg) {
    var status = 1;
    var popup = '<div class="newmsg_popup" data-role="popup" data-theme="b"><ul data-role = "listview" data-inset = "true">';
    popup = popup + '<li data-role="list-divider">New message from ' + msg.from + '</li><li class="ui-last-child">' + msg.message + '</li>';
    popup = popup + '</ul></div>';
    var from_email = msg.from,
            from_btn = "btn_" + mail2id(from_email),
            currentpage = $(':mobile-pagecontainer').pagecontainer('getActivePage')[0].id;
    if (chat.currentWindow !== from_email || currentpage !== "chat") {
        $(popup).appendTo("#" + currentpage + " .ui-content").enhanceWithin();
        $(".newmsg_popup").fadeOut(10000);
        $("#" + from_btn + " i").addClass('newmsg');
        //localDb.updateMenu();
        status = 0;
    } else {
        chat.dispMessage("user2", from_email, msg.message);
    }

    var msg_id = msg.id;
    var data = {id: msg_id, from: from_email, to: getVal(config.user_email), msg_en: msg.message, msg_tm: "here is tamil", status: status};
    localDb.addMessage(data);
};

chat.signin = function () {
    console.log("Signing in : " + getVal(config.user_email));
    socket.emit('signin', getVal(config.user_email));
};

chat.send = function (e) {
    var to = $('#to').val();
    var msg = $('#msg').val();
    var msg_id = uuid.v1();

    var data = {id: msg_id, from: getVal(config.user_email), to: to, msg_en: msg, msg_tm: "", status: 1};
    localDb.addMessage(data);

    socket.emit('chat message', {
        id: msg_id,
        message: msg,
        from: getVal(config.user_email),
        to: to,
        status: 1
    });

    chat.dispMessage("user1", getVal(config.user_name), msg);
    $('#msg').val('');
    $('#msg').focus();
    return false;
};


chat.dispMessage = function (cls, name, msg) {
    var now = new Date(),
            hh = now.getHours(),
            mm = now.getMinutes(),
            timeMark = hh + ':' + mm;
    var content = '<div class=" ' + cls + '"><div class="txtmsg">' + nl2br(msg) + '<span>' + timeMark + '</span></div></div>';
    $("#messages").append(content);
    $('#messages').animate({
        scrollTop: $('#messages').prop("scrollHeight")}, 100);
};

chat.sendStatus = function (msg) {
    socket.emit('chat_message_status_change_email', {
        id: msg.id,
        from: msg.from,
        status: 4
    });
}
