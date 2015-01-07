var socket = io(config.nodeJs);
socket.on('connect', function (msg) {
});
var chat = {};
socket.on('chat message', function (msg) {
    chat.message(msg);
});
chat.currentWindow = null;
chat.windowTolerance = 150;
chat.init = function () {
};
chat.message = function (msg) {
    var status = 1;
    var popup = '<div data-role="popup" data-theme="b"><ul data-role = "listview" data-inset = "true" style = "min-width:210px;">';
    popup = popup + '<li data-role = "list-divider">You have new message</li>';
    popup = popup + '</ul></div>';
    var from_email = msg.from,
            from_btn = "btn_" + mail2id(from_email),
            currentpage = $(':mobile-pagecontainer').pagecontainer('getActivePage')[0].id;
    if (chat.currentWindow !== from_email || currentpage !== "chat") {
        $("#" + currentpage + " .ui-content").append('<div class="newmsg_popup"><p>' + msg.from + '</p><p>' + msg.message +'</p></div>');
        $(".newmsg_popup").fadeOut(10000);
        $("#" + from_btn + " i").addClass('newmsg');
        //localDb.updateMenu();
        status = 0;
    } else {
        chat.dispMessage("user2", from_email, msg.message);
    }

    var msg_id = Math.floor(Math.random() * 10000000);
    var data = {id: msg_id, from: from_email, to: getVal(config.user_email), msg_en: msg.message, msg_tm: "here is tamil", status: status};
    localDb.addMessage(data);
};
chat.signin = function () {
    console.log("Signing in : " + getVal(config.user_email));
    socket.emit('signin', getVal(config.user_email));
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
