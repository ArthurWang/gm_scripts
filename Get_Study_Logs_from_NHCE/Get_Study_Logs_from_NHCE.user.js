// ==UserScript==
// @name           Get Study Logs from NHCE
// @namespace      http://fromnowhere.com
// @description    Get Study Logs from NHCE
// @include        /.*manager/faculty07/onlineclass.php$/
// @version        0.1
// ==/UserScript==

// store all urls for every student's log info
// gURLs[0] is for log info
// gURLS[1] is for detail log info
var gURLs = null;

// store class info for output info
var gClassInfo = null;

// a DOM table for online time statistics
var gOnlineTimeTable = null;

// a DOM table for web page statistics
var gWebPageTable = null;

// a DOM table for month statistics
var gMonthTable = null;

// get all detail log's url 
function getURLs() {
    if (gURLs == null) {
        // initialize array
        gURLs = new Array();
        gURLs[0] = new Array();
        gURLs[1] = new Array();

        // the url contains "StudentID=" should be useful url
        var pattern = /StudentID=/; 
        var elms = document.getElementsByTagName('a');
        var totalNumber = 0;
        for (var i = 0; i < elms.length; i++) { 
            // filter all url, only store useful url    
            if(pattern.test(elms[i].href)) {
                // save log url 
                gURLs[0][totalNumber] = elms[i].href;
                // save log detail url from log url
                gURLs[1][totalNumber] = elms[i].href.replace(/onlinetime.php\?/, "onlinedetail.php?DateWhat=ALL&");
                totalNumber++;
            }
        }
    } 
}

function insertRecords(tableInstance, trList, studentID, studentName, tableType) {
    // "i = 1" don't process caption 
    for (var i = 1; i < trList.length; i++) {
        // create a tr for table
        var newTR = document.createElement('tr');
        // add student id to the tr
        var newTD = document.createElement('td');
        var newText =  document.createTextNode(studentID);
        newTD.appendChild(newText);
        newTR.appendChild(newTD);

        // add student name to the tr
        newTD = document.createElement('td');
        newText =  document.createTextNode(studentName);
        newTD.appendChild(newText);
        newTR.appendChild(newTD);
    
        var tdList = trList[i].getElementsByTagName('td');
        for (var j = 0; j < tdList.length; j++) {
            newTD = document.createElement('td');
            newText =  document.createTextNode(tdList[j].innerHTML.replace(/&nbsp;/g, ''));
            newTD.appendChild(newText);
            newTR.appendChild(newTD);
        }
        // insert new TR into on line Time Table 
        tableInstance.appendChild(newTR);
        console.log(newTR.innerHTML);
    }
}


function doLogReponse(responseText) {
    var div = document.createElement( 'div' );
    div.innerHTML = responseText;

    // get all tables into node list
    var tableList = div.getElementsByTagName('table');
    
    console.log (tableList.length);
    console.log (tableList);
    

    // table[1] is "班级信息"
    console.log("************************************");
    console.log("            班级信息                ");
    console.log("************************************");

    if (gClassInfo == null) {
        // get & store class info 
        var re = /(班级：\S+).*(课程：\S+)/;
        re.exec(tableList[1].getElementsByTagName('b')[0].innerHTML.replace(/&nbsp;/g, ' '));
        gClassInfo = RegExp.$1 + ' ' + RegExp.$2;
    }
    console.log(gClassInfo);

    // table[5] is "学生信息"
    console.log("************************************");
    console.log("            学生信息                ");
    console.log("************************************");

    var studentName = null;
    var studentID = null;
    var trList = tableList[5].getElementsByTagName('tr');

    for (var i = 0; i < trList.length; i++) {
        var tdList = trList[i].getElementsByTagName('td');
        for (var j = 0; j < tdList.length; j++) {
            if (i == 0 && j == 0) {
                studentName = tdList[j].innerHTML;
            }
            if (i == 1 && j == 0) {
                studentID = tdList[j].innerHTML
            }
        }
    }
    console.log ("INFO: %s  %s", studentID, studentName);

        // table[6] is "分月统计"
    console.log("************************************");
    console.log("            分月统计                ");
    console.log("************************************");

    var trList = tableList[7].getElementsByTagName('tr');
    insertRecords(gMonthTable, trList, studentID, studentName, 'Month');
}

function  doLogDetailReponse(responseText) {
    var div = document.createElement( 'div' );
    div.innerHTML = responseText;

    // get all tables into node list
    var tableList = div.getElementsByTagName('table');
 
    //console.log(tableList);
    //console.log(tableList.length);

    // table[1] is "班级信息"
    console.log("************************************");
    console.log("            班级信息                ");
    console.log("************************************");

    if (gClassInfo == null) {
        // get & store class info 
        var re = /(班级：\S+).*(课程：\S+)/;
        re.exec(tableList[1].getElementsByTagName('b')[0].innerHTML.replace(/&nbsp;/g, ' '));
        gClassInfo = RegExp.$1 + ' ' + RegExp.$2;
    }
    console.log(gClassInfo);
                
    // table[5] is "学生信息"
    console.log("************************************");
    console.log("            学生信息                ");
    console.log("************************************");

    var studentName = null;
    var studentID = null;
    var trList = tableList[5].getElementsByTagName('tr');

    for (var i = 0; i < trList.length; i++) {
        var tdList = trList[i].getElementsByTagName('td');
        for (var j = 0; j < tdList.length; j++) {
            if (i == 0 && j == 0) {
                studentName = tdList[j].innerHTML;
            }
            if (i == 1 && j == 0) {
                studentID = tdList[j].innerHTML
            }
        }
    }
    console.log ("INFO: %s  %s", studentID, studentName);

    // table[6] is "上网时间统计"
    console.log("************************************");
    console.log("            上网时间                ");
    console.log("************************************");

    var trList = tableList[6].getElementsByTagName('tr');
    insertRecords(gOnlineTimeTable, trList, studentID, studentName, 'OnlineTime');
                
    // table[7] is "页面情况"
    console.log("************************************");
    console.log("            页面情况                ");
    console.log("************************************");

    var trList = tableList[7].getElementsByTagName('tr');
    insertRecords(gWebPageTable, trList, studentID, studentName, 'WebPage');

}


function showResultWindow(title, table) {
    var resultWindow = window.open('');
    resultWindow.document.title = title;
    resultWindow.document.body.innerHTML = table.outerHTML;
}

function getLog() {
    var xhr = new XMLHttpRequest();

    // process response
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log("Response OK!!!!");
            doLogReponse(xhr.responseText);
        } 
    };

    // create table for on line time statistics page
    gMonthTable = document.createElement('table');
    
    // send request to get log detail info 
    for (var i = 0; i < gURLs[0].length; i++) {
    //for (var i = 0; i < 2; i++) {
        console.log("************************************");
        console.log("             No. %d/%d", i + 1, gURLs[1].length);
        console.log("************************************");

        updateProgress(Math.round(((i + gURLs[0].length)/(gURLs[0].length*2)) * 100));

        xhr.open('GET', gURLs[0][i], false);
        xhr.overrideMimeType("text/html;charset=gb2312");
        xhr.send();
    }
}

// send request to server for every students.
function getLogDetail() {
    var xhr = new XMLHttpRequest();

    // process response
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log("Response OK!!!!");
            doLogDetailReponse(xhr.responseText);
        } 
    };

    // create table for on line time statistics page
    gOnlineTimeTable = document.createElement('table');

    // create table for Web Page statistics page
    gWebPageTable = document.createElement('table');
    
    // send request to get log detail info 
    for (var i = 0; i < gURLs[1].length; i++) {
    //for (var i = 0; i < 2; i++) {
        console.log("************************************");
        console.log("             No. %d/%d", i + 1, gURLs[1].length);
        console.log("************************************");

        updateProgress(Math.round((i/(gURLs[1].length*2)) * 100));

        xhr.open('GET', gURLs[1][i], false);
        xhr.overrideMimeType("text/html;charset=gb2312");
        xhr.send();
    }

}

function displayResult() {
    // get time
    var d = new Date();
    
    // show info on new page
    showResultWindow('上网时间统计表 ' + gClassInfo + ' ' + d.toLocaleString(), gOnlineTimeTable);

    // show info on new page
    showResultWindow('页面情况统计表 ' + gClassInfo + ' ' + d.toLocaleString(), gWebPageTable);

    // show info on new page
    showResultWindow('分月统计表 ' + gClassInfo + ' ' + d.toLocaleString(), gMonthTable);
}

// main function
function getStudyLogs() {

    // get all URLS which contain every student's info  
    getURLs();

    // send request to server for every students.
    getLogDetail();
    
    // send request to get log info
    getLog();

    updateProgress(100);
    
    displayResult();
    
}


function updateProgress(progressVal) {
    if (progressVal < 100) {
        gButton.innerHTML = '运行中: ' + progressVal + '%';
    } else {
        gButton.disabled = '';
        gButton.innerHTML = '听力成绩统计';
    }
}

function doClick() {
    gButton = document.getElementById ("myButton");
    gButton.disabled = 'disabled';
    gButton.innerHTML = '开始运行: 0%';
    try {
        getStudyLogs();
    } catch(e) {
        alert(e.name + ": " + e.message);
    }
}

function addButton() {
    var div = document.createElement ('div');
    div.innerHTML = '<button  id="myButton" type="button" style="position:absolute; left:45%;" >上网日志统计</button>';
    document.body.appendChild(div);
    document.getElementById ("myButton").addEventListener ("click", doClick, false);
}

addButton();

//GM_registerMenuCommand('Get Study Logs from NHCE', tmpDebug)