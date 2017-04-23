// file: background script
// author: harttle
// Popup can be closed anytime, async job should be done here.

var req, responseHandler, currOperation, closingHandler;
var unreadmails = 0;

function request(method, action, args) {
    var mapping = {
        'initialize': 'https://its.pku.edu.cn',
        'login': 'https://its.pku.edu.cn/cas/webLogin',
        'connect': 'https://its.pku.edu.cn/netportal/ITSipgw?cmd=open&type=fee',
        'disconnect': 'https://its.pku.edu.cn/netportal/ITSipgw?cmd=close&type=self',
        'disconnectall': 'https://its.pku.edu.cn/netportal/ITSipgw?cmd=close&type=all',
        'checkmail': 'https://its.pku.edu.cn/netportal/checkmail',
        'show': 'https://its.pku.edu.cn/netportal/ITSipgw?cmd=getconnections',
        'getinfo': 'https://its.pku.edu.cn/netportal/ipgwResult.jsp'
    };

    var promise = new Promise(function(resolve, reject){
        var request = new XMLHttpRequest();
        request.open(method, mapping[action], 'false');
        request.onload = onloadCallback;
        request.timeout = 7000;
        request.ontimeout = error_timeout;
        request.onabort = error_abort;
        request.onerror = error_error;
        if (method === 'GET') {
            request.send(null);
        } else if (method === 'POST') {
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8')
            request.send(args);
        }
        function onloadCallback() {
            if (this.status === 200) {
                resolve(this.responseText);
            } else {
                reject(new Error(this.status + ' ' + this.statusText));
            }
        }
        function error_timeout(evt) {
            localStorage.state = "网络连接超时(" + evt.type + ")";
            responseHandler({});
            request.close();
        }
        function error_abort(evt) {
            localStorage.state = "网络中断(" + evt.type + ")";
            responseHandler({});
        }
        function error_error(evt) {
            localStorage.state = "网络连接错误(" + evt.type + ")";
            responseHandler({});
        }
    });
    return promise;
}

function ipgwNew(operation){
    currOperation = operation;
    var loginArgs = "username=" + localStorage.user + "&password=" + localStorage.passwd + "&iprange=no";
    if (operation === 'checkmail') {
        //request('GET', 'initialize')
            //.then(() => { return request('POST', 'login', loginArgs); })
      request('POST', 'login', loginArgs)
          .then(() => { return request('GET', 'checkmail'); })
          .then(checkmailCallback);
    } else {
        //request('GET', 'initialize')
            //.then(() => { return request('POST', 'login', loginArgs); })
        request('POST', 'login', loginArgs)
            .then(() => { 
                switch (currOperation) {
                    case 'connect': 
                        return request('GET', 'connect');
                    case 'disconnect': 
                        return request('GET', 'disconnect');
                    case 'disconnectall': 
                        return request('GET', 'disconnectall');
                }})
            .then(connectCallback);
    }
}

function checkmailCallback(responseText){
    if (responseText !== "0\n") {
        localStorage.state = "";
        unreadMails = parseInt(responseText);
        text = '收件箱有 ' + unreadMails + ' 封未读邮件';
        icon = '/public/img/icon48.png';
        showNotification(icon, '未读邮件', text);
    }
}

function op_getinfo(){
    var status = new XMLHttpRequest();
    status.open("GET", "https://its.pku.edu.cn/netportal/ipgwResult.jsp", "false");
    status.send(null);
    status.onload = function() {
        var stat = status.responseText;
        parseResponse(stat);
    }
}

function parseResponse(response) {
    var tempDom = document.createElement('div');
    var connectInfo = [];
    tempDom.innerHTML = response;
    mainTable = tempDom.querySelectorAll('tr[align=center] table');
    
    if (mainTable[0].getElementsByTagName('td')[0].innerHTML.split('<')[0] === '网络连接成功') {
        var statusText = mainTable[1].querySelectorAll('td[align=left]');
        connectInfo.SUCCESS = 'YES'; 
        connectInfo.USERNAME = statusText[0].innerHTML.trim();
        connectInfo.IP = statusText[1].innerHTML.trim();
        connectInfo.BALANCE = statusText[4].innerText.trim();
    } else if (mainTable[0].getElementsByTagName('td')[0].innerHTML.split('<')[0] === '连接失败') {
        connectInfo.SUCCESS = 'NO';
        connectInfo.REASON = mainTable[1].getElementsByTagName('td')[0].innerHTML.trim();
    }
    return connectInfo;
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
    // set extension button icon
    chrome.browserAction.setIcon({path: icon});
}

//connect result
function connectCallback(response) {
    var info = parseResponse(response),
        icon = "icon.ico", text = "";

    if (info.SUCCESS == "YES") {
        switch (currOperation) {
            case "connect":
                localStorage.state = "网络连接成功（免费）";
                text = "用户：" + info.USERNAME + "\n" +
                    "余额：" + info.BALANCE + "\n" +
                    "IP：" + info.IP;
                icon = "public/img/icon48.png";
                break;
            case "disconnect":
                localStorage.state = "断开当前连接成功";
                text = "IP：" + info.IP;
                icon = "background/disc.ico";
                break;
            case "disconnectall":
                localStorage.state = "断开全部连接成功";
                text = "IP：" + info.IP;
                icon = "background/disc.ico";
                break;
            if (unreadmails !== 0)
                text += "\n" + "您有" + unreadmails + "条未读邮件";
        }
    } else {
        text += "原因：" + info.REASON;
        switch (currOperation) {
            case "connect":
                localStorage.state = "网络连接失败";
                icon = "background/busy.ico";
                break;
            case "disconnect":
                localStorage.state = "断开连接失败";
                icon = "background/busy.ico";
                break;
            case "disconnectall":
                localStorage.state = "断开全部连接失败";
                icon = "background/busy.ico";
                break;
        }
    }

    showNotification(icon, localStorage.state, text);
    responseHandler({});
    closingHandler();
}

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.method === 'operation') {
            responseHandler = sendResponse;
            if (request.connectOperation) {
                ipgwNew(request.connectOperation);
            }
        }
        else if (request.method === 'closing') {
            closingHandler = sendResponse;
        }
    }
);
