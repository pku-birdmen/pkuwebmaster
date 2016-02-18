//file: options script
//author: harttle & Rea

window.onload = function () {
    restore_options();
    document.querySelector('#save').addEventListener(
        'click', save_options);
	document.querySelector('#reset').addEventListener(
        'click', reset);
	document.querySelector('#contact').addEventListener(
        'mouseover',change_contact);
	document.querySelector('#reset').addEventListener(
        'mouseover',change_cloth_reset);
	document.querySelector('#reset').addEventListener(
        'mouseout',back_cloth_reset);
		
	document.querySelector('#save').addEventListener(
        'mouseover',change_cloth_save);
	document.querySelector('#save').addEventListener(
        'mouseout',back_cloth_save);
	
	document.querySelector('#user').addEventListener(
        'mouseover',change_cloth_user);
	document.querySelector('#user').addEventListener(
        'mouseout',back_cloth_user);
	// document.querySelector('#user').addEventListener(
        // 'onfocus',back_bg_user);
		
	document.querySelector('#passwd').addEventListener(
        'mouseover',change_cloth_passwd);
	document.querySelector('#passwd').addEventListener(
        'mouseout',back_cloth_passwd);
	document.querySelector('#passwd').addEventListener(
        'keydown',if_save);

	}

function change_contact(){
// document.getElementById("contact").innerHTML="<a id='contact' ' target='_blank' href='mailto:yangjvn@126.com' title='联系我们'>yangjvn@126.com</a>";
document.getElementById("contact").innerHTML="yangjvn@126.com";

}

function change_cloth_reset(){
var temp =document.getElementById("reset");
temp.setAttribute("class","style2");
}

function back_cloth_reset(){
var temp =document.getElementById("reset");
temp.setAttribute("class","style1");
}

function change_cloth_save(){
var temp =document.getElementById("save");
temp.setAttribute("class","style2");
}

function back_cloth_save(){
var temp =document.getElementById("save");
temp.setAttribute("class","style1");
}

function change_cloth_user(){
var temp =document.getElementById("user");
temp.setAttribute("class","input_2");
}

function back_cloth_user(){
var temp =document.getElementById("user");
temp.setAttribute("class","input_1");
}

// function back_bg_user(){
// alert("a");
// var temp =document.getElementById("user");
// temp.setAttribute("class","input_3");
// }

function change_cloth_passwd(){
var temp =document.getElementById("passwd");
temp.setAttribute("class","input_2");
}

function back_cloth_passwd(){
var temp =document.getElementById("passwd");
temp.setAttribute("class","input_1");
}

function if_save(){
	if(event.keyCode == 13)
	{
	save_options();
	}
}
// Saves options to localStorage.
function save_options() {
    localStorage["user"] = document.getElementById("user").value;
    localStorage["passwd"] = document.getElementById("passwd").value;

    // Update status to let user know options were saved.
    update_status("已保存");
}

// Reset options from localStorage.
function reset() {
    restore_options();
    update_status("已还原");
}

// Restores options from localStorage.
function restore_options() {
    var datap = localStorage["passwd"];
    if (datap) {
        document.getElementById("passwd").value = datap;
    }

    var datau = localStorage["user"];
    if (datau) {
        document.getElementById("user").value = datau;
    }
}

// show status
function update_status(status_str) {
    var status = document.getElementById("status");
	var temp=status_str;
	    status.innerHTML = temp.fontcolor("#8dbede").bold();
    setTimeout(function () {
        status.innerHTML = "";
    }, 1000);
}