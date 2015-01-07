var localDb = {};
localDb.db = null;
localDb.init = function () {
    localDb.openDb();
    localDb.createTable();
};

localDb.openDb = function () {
    var is_device = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    if (window.navigator.simulator === true || is_device === false) {
        // For debugin in simulator fallback to native SQL Lite
        console.log("Use built in SQL Lite");
        localDb.db = window.openDatabase(config.db_name, "1.0", "Uravu local DB", 5 * 1024 * 1024);
        console.log("DB opened");
    } else {
        localDb.db = window.sqlitePlugin.openDatabase({name: config.db_name});
    }
};

localDb.onError = function (tx, e) {
    console.log("Error: " + e.message);
    alert("Error: " + e.message);
};

localDb.onSuccess = function (tx, r) {
    //localDb.refresh();
};

localDb.createTable = function () {
    var db = localDb.db;

    db.transaction(function (tx) {
        //tx.executeSql('DROP TABLE message');
        //tx.executeSql('DROP TABLE user');
        tx.executeSql('CREATE TABLE IF NOT EXISTS message (' +
                'ID INTEGER NOT NULL PRIMARY KEY,' +
                'user INTEGER NOT NULL,' +
                'sender VARCHAR(200) NOT NULL,' +
                'receiver VARCHAR(200) NOT NULL,' +
                'msg_en TEXT,' +
                'msg_tm TEXT,' +
                'created_at DATETIME,' +
                'status INTEGER' +
                ')', []);
        tx.executeSql('CREATE TABLE IF NOT EXISTS user (' +
                'id INTEGER NOT NULL,' +
                'user INTEGER NOT NULL,' +
                'name VARCHAR(200) NOT NULL,' +
                'email VARCHAR(200) NOT NULL,' +
                'mobile VARCHAR(200),' +
                'tags TEXT,' +
                'about TEXT,' +
                'image VARCHAR(200) NOT NULL,' +
                'thumb VARCHAR(200) NOT NULL,' +
                'favorite INTEGER,' +
                'blocked INTEGER,' +
                'distance REAL,' +
                'last_updated DATETME,' +
                'CONSTRAINT pk_user_id PRIMARY KEY (id,user))', []);
    });
    console.log("Tables created");
};

/** User functitons *******************************************************************/

/*
 * 
 * @param string qry
 * @returns void
 */
localDb.syncUsers = function (qry) {
    if (getVal(config.user_session)) {
        console.log("Sync start....");
        var query = "";
        qry = $.trim(qry);
        if (qry !== "") {
            query = "/" + qry;
            $("#query").val(qry);
        }
        var api = new $.RestClient();
        api.add('users', {url: 'users' + query, apiKey: getVal(config.user_session)});
        var users = api.users.read();
        users.done(function (rs) {
            localDb.addUsers(rs.users);
            console.log("Sync end.");
        });
    }
};

localDb.addUsers = function (users) {
    var db = localDb.db;
    var loggedinUser = getVal(config.user_id);
    db.transaction(function (tx) {
        var currentDt = new Date();
        $.each(users, function (index, user) {
            console.log(user);
            tx.executeSql("REPLACE INTO user (id, user, name, email, mobile, tags, about, image, thumb, favorite, blocked, distance, last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    [user.id, loggedinUser, user.name, user.email, user.mobile, user.tags, user.about, user.image, user.thumb, user.favorite, user.blocked, user.distance, currentDt],
                    localDb.onSuccess,
                    localDb.onError);

        });
    });
};

localDb.getProfile = function () {
    // We need to sync own data to local
    // then only we may get this done
    var db = localDb.db;
    var loggedinUser = getVal(config.user_id);
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM USER WHERE id = ? and user = ?', [loggedinUser, loggedinUser],
                render,
                localDb.onError);
    });
    var render = function (tx, rs) {
        var user = rs.rows.item(0);
        console.log(user);
        console.log('Rendering user details....');
    };
};

localDb.getUserById = function (id) {
    var db = localDb.db;
    var loggedinUser = getVal(config.user_id);
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM USER WHERE id = ? and user = ?', [id, loggedinUser],
                render,
                localDb.onError);
    });
    var render = function (tx, rs) {
        var user = rs.rows.item(0);
        console.log(user);
        $("#user-details").loadTemplate($('#user_details_tpl'), user, {append: false});
        dotrans();
        if (user.favorite == 1) {
            $('#favorite_active').addClass("ui-btn-active");
        } else {
            $('#favorite_active').removeClass("ui-btn-active");
        }
        if (user.blocked == 1) {
            $('#block_active').addClass("ui-btn-active");
        } else {
            $('#block_active').removeClass("ui-btn-active");
        }
        console.log('Rendering user details....');
    };
};

localDb.getFavoriteUsers = function () {
    var db = localDb.db;
    var user = getVal(config.user_id);
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM USER WHERE favorite = 1 and user = ?', [user],
                render,
                localDb.onError);
    });
    var render = function (tx, rs) {
        var users = [];
        for (var i = 0; i < rs.rows.length; i++) {
            users.push(rs.rows.item(i));
        }
        $("#favusers").empty();
        $.each(users, function (a, b) {
            $("#favusers").loadTemplate($('#favorite_users_list_tpl'), b, {append: true});
        });
        console.log('Rendering favorite users....');
    };
};

localDb.getBlockedUsers = function () {
    var db = localDb.db;
    var user = getVal(config.user_id);
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM USER WHERE blocked = 1 and user = ?', [user],
                render,
                localDb.onError);
    });
    var render = function (tx, rs) {
        var users = [];
        for (var i = 0; i < rs.rows.length; i++) {
            users.push(rs.rows.item(i));
        }
        $("#blockusers").empty();
        $.each(users, function (a, b) {
            $("#blockusers").loadTemplate($('#blocked_users_list_tpl'), b, {append: true});
        });
        console.log('Rendering blocked users....');
    };
};

localDb.getUsers = function (qry) {
    log("getting users.....", 3);
    var db = localDb.db;
    var user = getVal(config.user_id);
    var sort_by = "u.distance ASC";
    var filter = getFilterConfig();
    var rs = $.parseJSON(filter);
    console.log(rs);
    var qry_build = "";
    if (qry !== "") {
        qry_build = " and name like '%" + qry + "%' ";
    }
    if (typeof(rs.sortby) != null && rs.sortby === "name") {
        sort_by = 'u.name ASC';
    }
    db.transaction(function (tx) {
        tx.executeSql("SELECT u.id, u.name, u.email, u.tags, u.image, u.distance, count(m.id) as unread FROM user as u left join message as m on u.user = m.user and u.email = m.sender and m.status = 0 where u.user = ? GROUP BY u.email ORDER BY " + sort_by, [user],
                render,
                localDb.onError);
    });

    var render = function (tx, rs) {
        var users = [];
        log("Users count : " + rs.rows.length, 3);
        for (var i = 0; i < rs.rows.length; i++) {
            users.push(rs.rows.item(i));
        }
        $("#users").empty();
        $.each(users, function (a, b) {
            $("#users").loadTemplate($('#users_list_tpl'), b, {append: true});
        });
        console.log('Rendering users....');
    };
};

/** Chat message functions *************************************************************/
localDb.addMessage = function (msg) {
    var db = localDb.db;
    var user = getVal(config.user_id);
    db.transaction(function (tx) {
        var createdAt = new Date();
        tx.executeSql("INSERT INTO message (ID, user, sender, receiver, msg_en, msg_tm, status, created_at) VALUES (?,?,?,?,?,?,?,?)",
                [msg.id, user, msg.from, msg.to, msg.msg_en, msg.msg_tm, msg.status, createdAt],
                localDb.onSuccess,
                localDb.onError);
    });
};

localDb.getMessages = function (sender) {
    var renderMessages = function (row) {
        var cls = "user1";
        if (sender == row.sender) {
            cls = "user2";
        }
        var now = new Date(row.created_at),
                hh = now.getHours(),
                mm = now.getMinutes(),
                timeMark = hh + ':' + mm;

        var content = '<div class=" ' + cls + '"><div class="txtmsg">' + nl2br(row.msg_en) + '<span>' + timeMark + '</span></div></div>';
        return content;
    };
    var render = function (tx, rs) {
        var rowOutput = "";
        var messages = document.getElementById("messages");
        for (var i = 0; i < rs.rows.length; i++) {
            rowOutput += renderMessages(rs.rows.item(i));
        }
        messages.innerHTML = rowOutput;
        localDb.clearUnread(sender);
    };
    var db = localDb.db;
    var user = getVal(config.user_id);
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM message where user= ? and (sender = ? or receiver = ?) ORDER BY created_at ASC", [user, sender, sender],
                render,
                localDb.onError);
    });
};

localDb.clearUnread = function (sender) {
    var db = localDb.db;
    var user = getVal(config.user_id);
    db.transaction(function (tx) {
        tx.executeSql("UPDATE message set status = 1 where user = ? and sender = ? and status = 0", [user, sender],
                localDb.onSuccess,
                localDb.onError);
    });
};

localDb.deleteMessage = function (id) {
    var db = localDb.db;
    db.transaction(function (tx) {
        tx.executeSql("DELETE FROM message WHERE ID=?", [id],
                localDb.onSuccess,
                localDb.onError);
    });
};

localDb.updateMenu = function () {
    console.log("Updating menu");
    var db = localDb.db;
    var user = getVal(config.user_id);
    db.transaction(function (tx) {
        tx.executeSql("SELECT count(sender) as unread FROM message where user = ? and status = 0 and unread > 0 GROUP BY sender ORDER BY created_at ASC", [user],
                render,
                function () {
                    alert('error occurs');
                });
    });

    var render = function (tx, rs) {
        console.log(rs.rows.item(0));
        console.log('Rendering unread chats....');
    };
};