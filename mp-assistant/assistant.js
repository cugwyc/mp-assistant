pageUrl = window.location.href;
// get token
var token;
if (pageUrl.indexOf("http://mp.weixin.qq.com/cgi-bin/indexpage?t=wxm-index&token=") != -1)
{
		var reg = /\d+/;
		var token =  reg.exec(pageUrl);
		token = token[0];
	htmlStr = "<p class=\"dev_access\" style=\"text-align:center;\">\
						<a class=\"btnGreen\" id=\"getuserlist\" style=\"margin:0px auto;margin-top:10px;width:174px;\" href=\"javascript:void(0);\">请先获取用户列表</a>\
					</p>";
	//$(".extendPanel").append(htmlStr);
	$(".extInfo").before(htmlStr);
	htmlStr = "<div id=\"typesel\"><input type=\"radio\" checked=\"checked\" name=\"sendtype\" value=\"text\" />文字\
					<input type=\"radio\" name=\"sendtype\" value=\"image\" />图片\
					<input type=\"radio\" name=\"sendtype\" value=\"voice\" />音频</div>\
					<div id=\"tips\">请输入需要群发的文字消息：</div>\
					<div id=\"inputmsg\" style=\"height:200px;margin-top:10px;background-color: #EAEAEA;\">\
					<input id=\"sendmsgcontent\" type=\"text\" value=\"\" style=\"width:100%;height:100%;\" />\
					</div>";
	$(".extInfo").before(htmlStr);
	htmlStr = "<p class=\"dev_access\" style=\"text-align:center;\">\
						<a class=\"btnGreen\" id=\"sendmsgbtn\" style=\"margin:0px auto;margin-top:10px;width:174px;\" href=\"javascript:void(0)\">点此群发消息</a>\
					</p>";
	$(".extInfo").before(htmlStr);
	htmlStr = "<p class=\"dev_access\" style=\"text-align:center;\">\
						<a class=\"btnGreen\" id=\"pauseSend\" style=\"float:left;margin-top:10px;width:60px;\" href=\"javascript:void(0)\">暂停群发</a>\
						<a class=\"btnGreen\" id=\"stopSend\" style=\"float:right;margin-top:10px;width:60px;\" href=\"javascript:void(0)\">终止群发</a>\
					</p>";
	$(".extInfo").before(htmlStr);
}
if (pageUrl.indexOf("http://mp.weixin.qq.com/cgi-bin/filemanagepage") != -1)
{
	$("#listContainer .listItem").each(function(){
		$(this).after("<p style=\"color:#FF0000;\">" + $(this).attr("id") + "</p>");
	});
}

// 全局变量
// 发送状态 0 还没发送 1 正在发送
var sendStatus = 0;
var index = 0;
var dingshiqi;
var storage = window.localStorage;
var storageLen = storage.length;
// 全局默认
var sendtype = 'text';


$("input[name='sendtype']").click(function(){
	sendtype = $(this).attr("value");
	if (sendtype == 'image')
	{
		$("#tips").html("请输入需要群发的图片的 fid ：");
	}
	else if (sendtype == 'voice')
	{
		$("#tips").html("请输入需要群发的语音的 fid ：");
	}
	if (sendtype == 'text')
	{
		$("tips").html("请输入需要群发的文字消息：");
	}
});

$("#pauseSend").click(function(){

	if ($("#sendmsgcontent").attr("value") != '' && sendStatus == 1)
	{
		// 暂停并保存现在发送的状态
		window.clearInterval(dingshiqi);
		$("#pauseSend").html('继续群发');
		sendStatus = 0;
	}
	else if ($("#sendmsgcontent").attr("value") != '' && sendStatus == 0)
	{
		sendStatus = 1;
		dingshiqi = window.setInterval(sendMsgf, 1000);
		$("#pauseSend").html('暂停群发');
	}
});
$("#stopSend").click(function(){

	if ($("#sendmsgcontent").attr("value") != '')
	{
		sendStatus = 0;
		index = 0;
		window.clearInterval(dingshiqi);
		$("#sendmsgbtn").html('点此群发消息');
	}
});

$("#sendmsgbtn").click(function(){

	if ($("#sendmsgcontent").attr("value") != '' && sendStatus == 0)
	{
		// 判断本地是否存有用户名单

		if (storageLen == 0)
		{
			alert('请先获取用户列表');
		}
		else
		{
			index = 0;
			dingshiqi = window.setInterval(sendMsgf, 1000);
		}
	}
});

function sendMsgf()
{
	sendStatus = 1;
	// 1秒发送一个，不过要用全局变量知道现在发送到哪里了。
	// 断网的判断，由于发送时间过长，断网应该自动暂停。
	// 或者处于消息连接状态
	var jsonstr = storage.getItem(index);
	jsonobj = JSON.parse(jsonstr);
	fakeId = jsonobj.fakeId;
	// 测试期间用自己的fakeid
	// 实际使用把下面一行干掉
	//fakeId = '1315157900';
	nickName = jsonobj.nickName;
	content = $("#sendmsgcontent").attr("value");
	// 测试期间使用构造内容
	// 实际使用把下面四行注视掉
	//currentDate = new Date();
	//month = currentDate.getMonth() + 1;
	//currentDateStr = currentDate.getFullYear() + '-' + month + '-' + currentDate.getDate() + ' ' + currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();
	//content = content + ' ' + index + "\n" + currentDateStr + "\n" + nickName;
	// 暂停一秒
	url = "http://mp.weixin.qq.com/cgi-bin/singlesend?t=ajax-response&lang=zh_CN";

	if (sendtype == 'text')
	{
		postData = { "type": "1", "content":content, "error":"false", "tofakeid":fakeId, "token":token, "ajax":"1" };
	}
	else if (sendtype == 'image')
	{

		postData = { "type": "2", "fid":content, "fileid":content, "error":"false", "tofakeid":fakeId, "token":token, "ajax":"1" };
	}
	else if (sendtype == 'voice')
	{
		postData = { "type": "3", "fid":content, "fileid":content, "error":"false", "tofakeid":fakeId, "token":token, "ajax":"1" };
	}

	console.log(token);
	console.log(postData);
	$.post(url, postData,
   function(data) {
	 leftMsg = storageLen - index - 1;
	 if (data.msg == 'ok')
	 {
		$("#sendmsgbtn").html('序号' + index + ' 向' + nickName + '发送成功 还剩下' + leftMsg + '条待发送');
	 }
	 else
	 {
		$("#sendmsgbtn").html('序号' + index + ' 向' + nickName + '发送成功 还剩下' + leftMsg + '条待发送');
	 }
	index ++;
	if (index == storageLen)
	{
		window.clearInterval(dingshiqi);
		sendStatus = 0;
		$("#sendmsgbtn").html('点此群发消息');
	}
   }, "json");


}

$("#getuserlist").click(function(){
	$("#getuserlist").html("获取中请稍等");
	tempUrl = "http://mp.weixin.qq.com/cgi-bin/contactmanagepage?t=wxm-friend&lang=zh_CN&pagesize=10&pageidx=0&type=0&groupid=0&token="+token;
	$.get(tempUrl, function(data) {
		tempStr = data;
		/*************************************
		// 此处使用正则取出数字
		startStr = "PageCount :";
		endStr = "PageSize";
		startPos = tempStr.indexOf(startStr) + startStr.length;
		endPos = tempStr.indexOf(endStr);
		tempStr = tempStr.slice(startPos, endPos);
		startStr = ": '";
		endStr = "'*1";
		startPos = tempStr.indexOf(startStr) + startStr.length;
		endPos = tempStr.indexOf(endStr);
		tempStr = tempStr.slice(startPos, endPos);

		*/
		// 正则是神器
		var reg = /\d*(?=\'\*1\,\s*PageSize)/;
		var result =  reg.exec(tempStr);
		minPage = 0;
		maxPage = result - 1;
		maxUsers = result * 10;
		console.log(maxUsers);
		// 构造用户列表地址请求进行获取用户列表
		userListUrl = 'http://mp.weixin.qq.com/cgi-bin/contactmanagepage?t=wxm-friend&token=' + token + '&pagesize=' + maxUsers;

		$.get(userListUrl, function(data) {
			//console.log($(data));
			//console.log($("#json-friendList", $(data)).html());
			objLen = $(data).length;

			for (i = 0; i < objLen; i ++)
			{
				if ($(data)[i].id == "json-friendList")
				{
					//使用原生DOM属性操作~
					//userList = eval($(data)[i].html());
					userList = eval($(data)[i].innerHTML);
				}
			}


			userListLen = userList.length;
			//http://mp.weixin.qq.com/cgi-bin/getcontactinfo?t=ajax-getcontactinfo&lang=zh_CN&fakeid=2483373380
			// 建立本地存储
			var storage = window.localStorage;
			storage.clear();
			var storageLen = storage.length;
			console.log('clear!!!');
			for (i = 0; i < userListLen; i ++)
			{
				//JSON.stringify
				fakeId = userList[i].fakeId;
				nickName = userList[i].nickName;
				remarkName = userList[i].remarkName;
				groupId = userList[i].groupId;
				var jsonobj = {'fakeId':fakeId, 'nickName':nickName, 'remarkName':remarkName, 'groupId':groupId};
				var jsonstr  = JSON.stringify(jsonobj);
				storage.setItem(i, jsonstr);
				console.log(i + jsonstr + ' saved!!!');
				// 存入本地存储
			}
			alert('成功获取所有' + userListLen + '用户');
			$("#getuserlist").html("请先获取用户列表");
			//console.log(userList);
		});

	});
});