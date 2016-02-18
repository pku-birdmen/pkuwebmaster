//file: options script
//author: harttle & Rea

window.onload = function() {
    restore_options();
    document.querySelector('#save').addEventListener(
        'click', save_options);
    document.querySelector('#reset').addEventListener(
        'click', reset_options);
    document.querySelector('#passwd').addEventListener(
        'keydown', detect_enter);
};

function detect_enter() {
    if (event.keyCode == 13) save_options();
}

function save_options() {
    localStorage.user = document.getElementById("user").value;
    localStorage.passwd = document.getElementById("passwd").value;
    update_status("保存成功！");
}

function reset_options() {
    restore_options();
    update_status("已重置！");
}

// Restores options from localStorage.
function restore_options() {
    var datap = localStorage.passwd;
    if (datap) {
        document.getElementById("passwd").value = datap;
    }

    var datau = localStorage.user;
    if (datau) {
        document.getElementById("user").value = datau;
    }
}

// show status
function update_status(status_str) {
    var status = document.getElementById("status");
    var temp = status_str;
    status.innerHTML = temp.fontcolor("#8dbede").bold();
    setTimeout(function() {
        status.innerHTML = "";
    }, 2000);
}
