// JavaScript Document
var lng=120,lat=36;
var centerlng=120.50188,centerlat=36.167649;
var largeflag=false;//图片是否放大的标志



$(document).on("pageinit","#newnote",function(){
	
	   //本地存储
	   //window.localStorage.setItem("username","王淑庆");
	   //var value=window.localStorage.getItem("username");
	  var  options = {timeout: 20000, enableHighAccuracy: true }; 
		navigator.geolocation.getCurrentPosition(function(position){
			    lng=position.coords.longitude;
				lat=position.coords.latitude;
			}, 
		   function(){
			  alert("获取位置失败");
		   },
	  options);
	$("#insertnote").click(function(){
	    insertNote();
	});
});

$(document).on("pageinit","#noteslist",function(){
  $("#refreshlist").on("tap",function(){
        SelectNote(4);
  })
  SelectNote(4);
});


$(document).on("pageinit","#detailnote",function(){
	$("#delete").on("tap",function(){
	   var id=$("#noteid").text();
	   DeleteNote(id);
	})
})
	//创建一个数据库对象
	function Opendatabase()
	{
		//4个参数分别是 数据库名,版本号，数据库的描述，数据库大小 
		 var travelnote=window.openDatabase("travelnote","1.0","travelnote-db",10000000);
         /*
		 		travelnote.transaction(function(t){
			    t.executeSql("delete from notestable");
			}); //删除数据表
		 */
		 return travelnote;
	}
    var travelnote=new Opendatabase();

	//插入数据
	function insertNote()
	{
		var createdate=new Date();
		createdate=createdate.getFullYear()+"-"+(createdate.getMonth()+1)+"-"+createdate.getDate()+" "+createdate.getHours()+":"+createdate.getMinutes()+":"+createdate.getSeconds();
		var title=$("#title").val();
		var detail=$("#detail").val();
		var pictureURI=$("#picture").attr("src");
		if(!title){
			title="无";
		}
		if(!detail){
			detail="无"
		}
		
		if(!pictureURI ||pictureURI=="#" ){
			pictureURI="images/start.png";
		}
		
		
	    travelnote.transaction(function(t){
		    t.executeSql('create table if not exists notestable (id integer not null primary key autoincrement,title text ,detail text,lng real,lat real,pictureuri text,createdate text)');
			   t.executeSql('insert into notestable(title,detail,lng,lat,pictureuri,createdate) values(?,?,?,?,?,?)',[title,detail,lng,lat,pictureURI,createdate]);	
		    }, function(error){
			  alert("添加失败"+error.message);
			}, function(){ 
			  $("#title").val("");
			  $("#detail").val("");
			  $("#picture").hide();
			  
			  $.mobile.changePage("#noteslist","slide",false,true);
			}
		);  
	}

//查询数据
function SelectNote(num){
   $.mobile.loading("show");
   var list=$("#notelistview"),items=[];
   travelnote.transaction(function(t){
	           t.executeSql("drop table if exists positions");
			   t.executeSql('select * from notestable  ORDER BY id DESC limit ?',[num],function(t,results){
					 for(i=0;i<results.rows.length;i++)
					 {
						   items.push("<li><a href='#detailnote'  data-noteid="+results.rows.item(i).id+"> <h2>" +results.rows.item(i).title+"</h2><p>创建日期："+                          results.rows.item(i).createdate+"</p></a></li>")
					 }
					 list.html(items.join(" "));
					 list.listview("refresh");
					 $("#notelistview a").click(function(e){
						 var noteid=$(this).attr("data-noteid");
						 Showdetailinfo(noteid);
					 });
					 $.mobile.loading("hide");  
					 
			   });	
		    }, function(error){
			  alert("查询失败"+error.message);
			  $.mobile.loading("hide");  
			}, function(){ 
			      $.mobile.loading("hide");  
			}
		);  
	
}

//显示详细信息
function Showdetailinfo(id)
{
	$.mobile.loading("show");
	travelnote.transaction(function(t){
	   t.executeSql('select * from notestable where id=?',[id],function(t,result){
		   
		    var title=result.rows.item(0).title;
			var picuri=result.rows.item(0).pictureuri;
		    var detail=result.rows.item(0).detail;
		    var createdate=result.rows.item(0).createdate;
		    var idhtml="<div id='noteid' style='display:none'>"+result.rows.item(0).id+"</div>"
		    var titlehtml="<b  style='font-size: 14px;line-height: 23px;padding: 4px 0 4px;'>"+title+":</b>";
	        var pichtml="<div style='width:100%; '><img width='30%' id='detailimage' style='' src="+picuri+"></div>";
			var ptlng=result.rows.item(0).lng;
			var ptlat=result.rows.item(0).lat;
			if(ptlng!=1201 && ptlat!=361){
				Translate(ptlng,ptlat,function(result){
					//百度反地址解析
					var pt=new BMap.Point(result.x,result.y);
					$("#showmap").on("tap",function(){
					    $.mobile.changePage("#home");
					    $(document).on("pageshow","#home",function(){
							 map.clearOverlays();
						     var sContent ="<h4 style='margin:0 0 5px 0;padding:0.2em 0'>"+title+"</h4><img style='float:right;margin:4px' width='139' height='104' id='imgDemo' src="+picuri+"><p  style='margin:0;line-height:1.5;font-size:13px;'>"+detail+"</p><p style='margin:0;line-height:1.5;font-size:13px;'>创建日期："                                           + createdate+"</p></div>";
                             var infoWindow = new BMap.InfoWindow(sContent);  // 创建信息窗口对象
							 map.setCenter(pt);
					         map.setZoom(17);
					         var marker=new BMap.Marker(pt);
					         map.addOverlay(marker);
							 marker.addEventListener("click",function(){
								    this.openInfoWindow(infoWindow);
								    document.getElementById('imgDemo').onload = function (){
                                            infoWindow.redraw();   //防止在网速较慢，图片未加载时，生成的信息框高度比图片的总高度小，导致图片部分被隐藏
                                    }
							 })
						})
						
						
						setTimeout(function(){

							 
						   },5000)
					});
				
					 var gc=new BMap.Geocoder(); 
					 gc.getLocation(pt, function(rs){
						 var addComp = rs.addressComponents;
						 var address=addComp.province + "," + addComp.city + "," + addComp.district;
						 if(addComp.street!="" && addComp.street!=null && addComp.street!=undefined)
						 {
							 address+=","+addComp.street;
						 }
						 if(addComp.streetNumber!="" && addComp.streetNumber!=null && addComp.streetNumber!=undefined)
						 {
							 address+=","+addComp.streetNumber;
						 }
						 
						 $("#locationaddress").text(address+" ");
					   }); 
				});
			}
			
			var detailhtml="<span style='font-size: 14px;line-height: 23px;padding: 4px 0 4px;'>"+detail+"</span></br>";
			var pos=null;
			if(lng==120 && lat==36)
			{
				pos="无位置信息"
			}
			var showpositionhtml="<div id='detaillocation'  style='font-size: 12px;padding: 0 0 10px;display:none;'><img src='images/weizhi.png' width='15' height='15'/>                              <span id='locationaddress'> </span><a href='#' id='showmap'>地图显示</a><div>"
			
			var createdatehtml="<div style='font-size: 12px;margin-top:10px;'><b >创建日期：</b><span>"+createdate+"</span></div>";
		    $("#detailinfo").html(idhtml+titlehtml+detailhtml+pichtml+showpositionhtml+createdatehtml);
			$.mobile.loading("hide");
			
			if(lng!=1201&&lat!=361){
			  $("#detaillocation").show();
			}
			
			$("#detailimage").on("tap",function(){
				if(largeflag==false){
			      $(this).css("width","90%");
				  largeflag=true;
				}
				else
				{
					$(this).css("width","20%");
					largeflag=false;
				}
			})
			
	   });
	   
	})
}



//删除日志
function DeleteNote(id)
{

	navigator.notification.confirm("确定要删除日志吗？",function(buttonIndex){
		if(buttonIndex==1){
			  travelnote.transaction(function(t){
		  t.executeSql("delete from notestable where id=?",[id],function(t,result){
				   alert("删除成功")
			  },function(err){
				  alert("删除失败")
			  })
		  });
		}
	},"温馨提示","确定,取消");

}

function RecordPosition(position)
{
	var lng=position.coords.longitude;
	var lat=position.coords.latitude;
	var time=new Date(position.timestamp);
	time=time.getFullYear()+"-"+(time.getMonth()+1)+"-"+time.getDate()+" "+time.getHours()+":"+time.getMinutes()+":"+time.getSeconds();
	var speed=position.coords.speed;
	var head=position.coords.heading;
	travelnote.transaction(function(t){
	  // t.executeSql("drop table positions");
	   t.executeSql("create table if not exists positions (id integer primary key autoincrement not null,lng real not null,lat real not null,time text not null)");
	   t.executeSql("insert into positions(lng,lat,time) values(?,?,?)",[lng,lat,time])
	},function(error){
		//alert("失败");
	},
	function(){
		//alert("成功")
	});
}
