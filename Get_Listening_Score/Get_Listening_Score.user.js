// ==UserScript==
// @name        Get Listening Score
// @namespace   http://fromnowhere.com
// @description Get Listening Score from NHCE
// @include     /.*/manager/faculty07/.*control-online.php$/
// @version     0.1
// ==/UserScript==

// store student's uuid and name
var gStudentArray = null;

// a DOM table for listening score for display
var gListeningScoreTable = null;

// store class info for output info
var gClassInfo = null;

var gButton = null;

function getStudentInfo() {
    if (gStudentArray == null) {
        gStudentArray = new Array();
        
        var sels = document.getElementsByTagName('select');
        var opts = sels[4].getElementsByTagName('option');
        // the last one is teacher
        for (var i = 0; i < (opts.length - 1); i++) {
            gStudentArray[i] = opts[i].value;
        }
        //console.log(gStudentArray);
    }
}


function doReponse(responseText) {
   
    var div = document.createElement( 'div' );
    div.innerHTML = responseText;

    // get all tables into node list
    var tableList = div.getElementsByTagName('table');

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
    
    // table[6] contain student name and score
    console.log("************************************");
    console.log("            学生信息                ");
    console.log("************************************");
    
    var str = tableList[6].getElementsByTagName('b')[0].innerHTML;
    var re = /(\S+)\(学号: (\S+)\)/;
    re.exec( tableList[6].getElementsByTagName('b')[0].innerHTML);
    var studentID = RegExp.$2;
    var studentName = RegExp.$1;

    console.log('[%s] [%s]', studentID, studentName);
    
 
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

    var trList = tableList[6].getElementsByTagName('tr');
    // last record contain score
    var tdList = trList[trList.length - 1].getElementsByTagName('td');
    for (var j = 1; j < tdList.length; j++) {
        newTD = document.createElement('td');
        newText =  document.createTextNode(tdList[j].innerHTML.replace(/&nbsp;/g, ''));
        newTD.appendChild(newText);
        newTR.appendChild(newTD);
    }
    // insert new TR into on line Time Table 
    gListeningScoreTable.appendChild(newTR);
    console.log(newTR.innerHTML);
}


function getURL() {
    var forms = document.getElementsByTagName('form');
    return forms[3].action.replace(/control-classdetail/, 'control-classlist');
}

function getListeningScore() {

    // get student UUID 
    getStudentInfo();
    
    // prepare communication
    var xhr = new XMLHttpRequest();

    // create table for on line time statistics page
    gListeningScoreTable = document.createElement('table');

    // response callback 
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log("Response OK!!!!");
            doReponse(xhr.responseText);
        } 
    };

    // get post url
    var postURL = getURL();
    
    // send request to get score for every student 
    for (var i = 0; i < gStudentArray.length; i++) {
    //for (var i = 0; i < 3; i++) {
        console.log("************************************");
        console.log("             No. %d/%d", i + 1, gStudentArray.length);
        console.log("************************************");
        
        updateProgress(Math.round((i/gStudentArray.length) * 100));
        
        xhr.open('POST', postURL, false);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        // form data 
        params = 'UserID=' + gStudentArray[i] + '&' + 'UnitID=ALL&TestID=ALL&Submit=Submit';
        xhr.send(params);
    }

    updateProgress(100);
    
    // show result
    var resultWindow = window.open('');
    resultWindow.document.title = '详细成绩统计表' + ' '+ gClassInfo;
    resultWindow.document.body.innerHTML = gListeningScoreTable.outerHTML;
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
        getListeningScore();
    } catch(e) {
        alert(e.name + ": " + e.message);
    }
}

function addButton() {
    var div = document.createElement ('div');
    div.innerHTML = '<button  id="myButton" type="button" style="position:absolute; left:45%;" >听力成绩统计</button>';
    document.body.appendChild(div);
    document.getElementById ("myButton").addEventListener ("click", doClick, false);
}

addButton();
