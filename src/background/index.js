// file: background script
// author: harttle
// Popup can be closed anytime, async job should be done here.

var req, response_handle, cur_operation, closing_handle,
    mappings = {
        SUCCESS: "状态",
        IP: "IP",
        CONNECTIONS: "连接数",
        REASON: "原因",
        STATE: "状态",
        USERNAME: "用户",
        SCOPE: "访问范围",
        FIXRATE: "是否包月",
        DEFICIT: "余额不足",
        BALANCE: "余额",
        MESSAGE: "备注",
        domestic: "免费地址",
        international: "收费地址",
        YES: "是",
        NO: "否",
        TOTAL_TIME: "累计时长"
    };

function ipgwclient(operation) {
    cur_operation = operation;
    var range, oper;
    switch (operation) {
        case "free":
            range = 2;
            oper = "connect";
            break;
        case "global":
            range = 1;
            oper = "connect";
            break;
        case "disconnect":
            range = 2;
            oper = "disconnectall";
            break;
        default:
            return;
    }
    req = new XMLHttpRequest();
    req.timeout = 7000;
    req.open("GET", "https://its.pku.edu.cn:5428/ipgatewayofpku?" + "uid=" + localStorage.user + "&password=" + localStorage.passwd + "&timeout=1&range=" + range + "&operation=" + oper, "true");
    req.onload = connect_callback;
    req.ontimeout = error_timeout;
    req.onabort = error_abort;
    req.onerror = error_error;
    req.send(null);
}

//get information dict from response string
function get_info_from_response(response) {
    var infos = response.split("<!--IPGWCLIENT_START ")[1].split(" IPGWCLIENT_END-->")[0].split(" "),
        connect_info = [], tmp;

    for (i = 0; i < infos.length; i++) {
        tmp = infos[i].split("=");
        if (tmp[0].trim() && tmp[1].trim())
            connect_info[tmp[0]] = tmp[1];
    }

    //parse REASON
    connect_info.REASON = connect_info.REASON && connect_info.REASON.replace("<br>", " ");

    return connect_info;
}


function showNotification(icon, title, text) {
    if (!Notification) return alert('您的浏览器不支持桌面通知');
    if (Notification.permission !== "granted") Notification.requestPermission();

    var notification = new Notification(title, {
        icon: icon,
        body: text
    });

    notification.replaceId = "connect_result";
    notification.onshow = function(event) {
        setTimeout(function() {
            notification.close();
        }, 7 * 1000);
    };
}

//connect result
function connect_callback() {
    var info = get_info_from_response(req.responseText),
        icon = "icon.ico", text = "";

    if (info.SUCCESS == "YES") {
        switch (cur_operation) {
            case "free":
                localStorage.state = "网络连接成功（免费）";
                text = "用户：" + info.USERNAME + "\n" +
                    "余额：" + info.BALANCE + "元\n" +
                    "IP：" + info.IP;
                icon = "background/succ.ico";
                break;
            case "global":
                localStorage.state = "网络连接成功（收费）";
                text = "用户：" + info.USERNAME + "\n" +
                    "余额：" + info.BALANCE + "元\n" + 
                    "IP：" + info.IP;
                if(info.FR_TIME) // 包月不限时时，FR_TIME字段不存在
                    text += '\n' + "包月累计时长：" + info.FR_TIME + "小时";
                icon = "background/succ.ico";
                break;
            case "disconnect":
                localStorage.state = "断开全部连接成功";
                text = "IP：" + info.IP;
                icon = "background/disc.ico";
                break;
        }
    } else {
        text += "原因：" + info.REASON;
        switch (cur_operation) {
            case "free":
                localStorage.state = "网络连接失败";
                icon = "background/busy.ico";
                break;
            case "global":
                localStorage.state = "网络连接失败";
                icon = "background/busy.ico";
                break;
            case "disconnect":
                localStorage.state = "断开全部连接失败";
                icon = "background/busy.ico";
                break;
        }
    }

    showNotification(icon, localStorage.state, text);
    response_handle({});
    closing_handle();
}

function get_default_string(info) {
    var text = "";
    for (var key in info) {
        var value = info[key];
        if (mappings[key]) key = mappings[key];
        if (mappings[value]) value = mappings[value];
        text = text + key + ":" + value + "； ";
    }
    return text;
}

function error_timeout(evt) {
    localStorage.state = "网络连接超时(" + evt.type + ")";
    response_handle({});
}

function error_abort(evt) {
    localStorage.state = "网络中断(" + evt.type + ")";
    response_handle({});
}

function error_error(evt) {
    localStorage.state = "网络连接错误(" + evt.type + ")";
    response_handle({});
}

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if(request.method === 'operation'){
            response_handle = sendResponse;
            if (request.connect_operation) {
                ipgwclient(request.connect_operation);
            }
        }
        else if(request.method === 'closing'){
            closing_handle = sendResponse;
        }
    });
