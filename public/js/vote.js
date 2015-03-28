////Handles downvote button
function upvote(myQid, rid){
	var url = "/vote/up/"+myQid+"/"+rid;
	$.ajax({
		url: url,
		type:'GET',
		dataType:'json',
		success: function(data){
			var eltID= '#votes'+rid;
			$(eltID).empty().append(data.data+" ");
		},
		
	});
}

//Handles downvote button	
function downvote(myQid, rid){
	var url = "/vote/down/"+myQid+"/"+rid;
	$.ajax({
		url: url,
		type:'GET',
		dataType:'json',
		success: function(data){
			var eltID= '#votes'+rid;
			$(eltID).empty().append(data.data+" ");
		},
	});
}