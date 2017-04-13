﻿//file: popup script
//author: harttle

var user, passwd, welcome, operation, state;

window.onload = function() {
    user = localStorage.user;
    passwd = localStorage.passwd;

    welcome = document.getElementById("welcome");
    operation = document.getElementById("operation");
    state = document.getElementById("state");

    //first run: check configuration & initial variables
    if (!user || !passwd) {
        welcome.style.display = '';
        operation.style.display = 'none';
        state.style.display = 'none';
        localStorage.state = "未连接";
    } else {
        welcome.style.display = 'none';
        operation.style.display = '';
        state.style.display = '';

        bindonclick('free', "正在连接...");
        bindonclick('global', "正在连接...");
        bindonclick('disconnect', "正在断开...");
        update_state();
    }
};

function update_state() {
    state.innerHTML = localStorage.state;
}

function bindonclick(btname, szstate) {
    bt = document.getElementById(btname);
    bt.addEventListener('click', function() {
        localStorage.state = szstate;
        chrome.extension.sendRequest({
            connect_operation: btname,
            method: 'operation'
        }, function(resp) {
            update_state();
        });
        update_state();
    });
}

chrome.extension.sendRequest({
    method: 'closing'
}, function() {
    window.close();
});