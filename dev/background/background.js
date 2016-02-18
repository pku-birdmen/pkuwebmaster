//file: background script
//author: harttle


//http request
var req = null;

//response to popup
var response_handle = null;

//current operation
var cur_operation = "";

//response map, with TOTAL_TIME
var mappings = {SUCCESS:"状态",IP:"IP",CONNECTIONS:"连接数",REASON:"原因",STATE:"状态",
    USERNAME:"用户",SCOPE:"访问范围",FIXRATE:"是否包月",DEFICIT:"余额不足",BALANCE:"余额",MESSAGE:"备注",
    domestic:"免费地址",international:"收费地址",YES:"是",NO:"否",TOTAL_TIME:"累计时长"};

//ipgw interface
function ipgwclient(operation) {
    cur_operation = operation;
    var range, oper;
    switch (operation) {
        case "free":
            range = 2; oper = "connect";
            break;
        case "global":
            range = 1; oper = "connect";
            break;
        case "disconnect":
            range = 2; oper = "disconnectall";
            break;
        default: return;
    }
    req = new XMLHttpRequest();
    req.timeout = 500;
    req.open("GET", "https://its.pku.edu.cn:5428/ipgatewayofpku?"
        + "uid=" + localStorage["user"]
        + "&password=" + localStorage["passwd"]
        + "&timeout=1&range=" + range
        + "&operation=" + oper, "true");
    req.onload = connect_callback;
    req.ontimeout = error_timeout;
    req.onabort = error_abort;
    req.onerror = error_error;
    req.send(null);
}

//get information dict from response string
function get_info_from_response(response){
    var infos = response.split("<!--IPGWCLIENT_START ")[1].split(" IPGWCLIENT_END-->")[0].split(" ");
    var connect_info = new Array();
    for (i = 0; i < infos.length; i++) {        
        var tmp = infos[i].split("=");
        if (tmp[0].trim() == "" || tmp[1].trim() == "") continue;
        connect_info[tmp[0]] = tmp[1];
    }

    //get TOTAL_TIME
    var tmp = response.split("包月累计时长：</td><td>");
    if(tmp.length > 1){
        connect_info["TOTAL_TIME"] = tmp[1].split("</td></tr>")[0];
    }

    //parse REASON
    if(connect_info["REASON"] != null){
        connect_info["REASON"] = connect_info["REASON"].replace("<br>"," ");
    }

    return connect_info;
}


//show desktop notification
function show(icon, title, text) {
    if (window.webkitNotifications.checkPermission() != 0) { // 0 is PERMISSION_ALLOWED
        window.webkitNotifications.requestPermission();
    }

    var notification = webkitNotifications.createNotification(icon, title, text);
    notification.replaceId = "connect_result";
    //var notification = webkitNotifications.createHTMLNotification('notification.html');  // HTML的URL，可以是相对路径
    notification.ondisplay = function (event) {
        //自动关闭
        setTimeout(function () {
            event.currentTarget.cancel();
        }, 7 * 1000);
    };
    notification.show();
}

//connect result
function connect_callback() {
    var info = get_info_from_response(req.responseText);
    var text = "", icon = "icon.ico";

    //get state, title, icon
    if (info["SUCCESS"] == "YES") {
        switch (cur_operation) {
            case "free":
                localStorage["state"] = "网络连接成功（免费）";
                text = "用户：" + info["USERNAME"] + '； '
                    //+ " 包月：" + mappings[info["FIXRATE"]] + '； '
                    + " 余额：" + info["BALANCE"] + '元； '
                    + " IP：" + info["IP"];
                icon = "background/succ.ico";
                break;
            case "global":
                localStorage["state"] = "网络连接成功（收费）";
                text = "用户：" + info["USERNAME"] + '； '
                    //+ " 包月：" + mappings[info["FIXRATE"]] + '； '
                    + " 累计时长：" + info["TOTAL_TIME"] + '； '
                    + " 余额：" + info["BALANCE"] + '元； '
                    + " IP：" + info["IP"];
                icon = "background/succ.ico";
                break;
            case "disconnect":
                localStorage["state"] = "断开全部连接成功";
                text = "IP：" + info["IP"];
                icon = "background/disc.ico";
                break;
        }
    }
    else {
        text += "原因：" + info["REASON"];
        switch (cur_operation) {
            case "free":
                localStorage["state"] = "网络连接失败";
                icon = "background/busy.ico";
                break;
            case "global":
                localStorage["state"] = "网络连接失败";
                icon = "background/busy.ico";
                break;
            case "disconnect":
                localStorage["state"] = "断开全部连接失败";
                icon = "background/busy.ico";
                break;
        }
    }    

    show(icon, localStorage["state"], text);
    response_handle({});
}

//get default information string
function get_default_string(info) {
    var text = "";
    for (var key in info) {
        var value = info[key];
        if (mappings[key] != null) key = mappings[key];
        if (mappings[value] != null) value = mappings[value];
        text = text + key + ":" + value + "； ";
    }
    return text;
}

//connect error
function error_timeout(evt) {
    localStorage["state"] = "网络连接超时("+evt.type+")";
    response_handle({});
}
function error_abort(evt) {
    localStorage["state"] = "网络中断(" + evt.type + ")";
    response_handle({});
}
function error_error(evt) {
    localStorage["state"] = "网络连接错误(" + evt.type + ")";
    response_handle({});
}


chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        response_handle = sendResponse;
        if (request.connect_operation != null) {
            ipgwclient(request.connect_operation);
        }
    });
