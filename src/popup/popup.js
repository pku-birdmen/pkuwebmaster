//file: popup script
//author: harttle

var user, passwd, $welcome, $operation, $state;

window.onload = function() {
    user = localStorage.user;
    passwd = localStorage.passwd;

    $welcome = document.getElementById("welcome");
    $operation = document.getElementById("operation");
    $state = document.getElementById("state");

    //first run: check configuration & initial variables
    if (!user || !passwd) {
        $welcome.style.display = '';
        $operation.style.display = 'none';
        $state.style.display = 'none';
        localStorage.state = "未连接";
    } else {
        $welcome.style.display = 'none';
        $operation.style.display = '';
        $state.style.display = '';

        bindOnclick('connect', "正在连接...");
        bindOnclick('disconnect', "正在断开...");
        bindOnclick('disconnectall', "正在断开全部连接...");
        bindOnclick('checkmail', "正在查看邮件...");
        updateState();
    }
};

function updateState() {
    $state.innerHTML = localStorage.state;
}

function bindOnclick(buttonName, stateText) {
    $bt = document.getElementById(buttonName);
    $bt.addEventListener('click', function() {
        localStorage.state = stateText;
        chrome.extension.sendRequest({
            connectOperation: buttonName,
            method: 'operation'
        }, function(resp) {
            updateState();
        });
        updateState();
    });
}

chrome.extension.sendRequest({
    method: 'closing'
}, function() {
    window.close();
});
