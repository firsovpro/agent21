/* global dhtmlx */
window.onhashchange = function () {
   window.location.reload(true);
}

var GlobalUser = null;

function parseGetParams() {
    var $_GET = {};
    var l = window.location.hash.split("?");
    if(l[1]){
        var __GET =l[1].split("&");
        for (var i = 0; i < __GET.length; i++) {
            var getVar = __GET[i].split("=");
            $_GET[getVar[0]] = typeof (getVar[1]) == "undefined" ? "" : getVar[1];
        }
    } else {
        $_GET = [];
    }
    return $_GET;
}



function reinit(){
    $( "[data-role='content']").empty();   
    var div = $('<div class="winInfo">').appendTo($("[data-role='content']"));
    div = $('<div class="filterDiv">').appendTo($("[data-role='content']"));
    div = $('<div class="firstDiv" name="firstDiv" id="firstDiv">').appendTo($("[data-role='content']"));    
    
        $( '.menuItem' ).click(function(){
            window.location.href =$(this).attr('href');
        })
        $( '.fa6' ).click(function(){
            console.log($(this).attr('item'));
            switch ($(this).attr('item')) {
                case 'Пользователи':
                    window.location.href ='/#users';
                    break;
                case 'Обьекты':
                    window.location.href ='/#objects';
                    break;
                default: 
            }

        })
    
    
        $.ajax({
            url: '/api/users',
            type: 'GET', //'POST',
            contentType: 'application/json',
            //traditional:true,
            //method:'POST',
            data:null,
            success: function (data) {
                if (data.result == "Error") {
                    dhtmlx.alert(data.error.message);
                    console.log('Получено--', data)
                } else {
                    GlobalUser = data.user;
                    if(GlobalUser==undefined){
                        dhtmlx.alert('<a href="/auth/yandex">Login with Yandex</a>');
                        return;
                    }
                    console.log('GlobalUser', GlobalUser);
                }
        
            },
            error: function (data) {
                GlobalUser = null;
                console.log(data);
//                dhtmlx.alert(data.responseJSON.error.message);
        
            },
        });  
        if (window.location.href.indexOf('?') != -1) {
            if (window.location.href.indexOf('#personal') != -1) {
                window['itemID'] = '#personal';
            } 
            if (window.location.href.indexOf('#objects') != -1) {
                window['itemID'] = '#objects';
            } 
        } else {
                window['itemID'] = window.location.hash;
        }
        switch (window['itemID']) {
            case '#users':
                $.ajax({
                    url: '/api/usersList',
                    type: 'GET', //'POST',
                    contentType: 'application/json',
                    //traditional:true,
                    //method:'POST',
                    data:null,
                    success: function (data) {
                        if (data.result == "Error") {
                            dhtmlx.alert(data.error.message);
                            console.log('Получено--', data)
                        } else {
                            console.log('Получено--', data)
                        }
                
                    },
                    error: function (data) {
                        console.log(data);
        //                dhtmlx.alert(data.responseJSON.error.message);
                    },
                });  
                break;
            case '#objects':
                switch (parseGetParams()['opp']) {
                    case 'edit':
                        $.ajax({
                            url: '/js/linc/objects/edit.html',
                            type: "GET",
                            contentType: 'application/json',
                            data: null,
                            //traditional: true,
                            success: function (data) {
                                if (data.result == "Error") {
                                    dhtmlx.alert(data.error.message);
                                    console.log('Получено--', data)
                                } else {
                                    $('.firstDiv').html(data);
                                }
                            }
                        });
                        break;
                    default:
                        $.ajax({
                            url: '/js/linc/objects/index.html',
                            type: "GET",
                            contentType: 'application/json',
                            data: null,
                            //traditional: true,
                            success: function (data) {
                                if (data.result == "Error") {
                                    dhtmlx.alert(data.error.message);
                                    console.log('Получено--', data)
                                } else {
                                    $('.firstDiv').html(data);
                                }
                            }
                        });
                }
                break;
            default:            
        }

}

$(function() {
    $('body').append('<div class="cssload-loader"  id="ajaxBusy"><div style="padding-left:40px">Загрузка</div></div>');

    $('#ajaxBusy').css({
        'z-index':999,
        display: "none",
        paddingLeft: "0px",
        paddingRight: "0px",
        paddingTop: "0px",
        paddingBottom: "0px",
        position: "absolute",
        left: "45%",
        top: "50%",
        width: "auto"
    });
    $(document).ajaxStart(function () {
        $('.content').addClass('bodyBuss');
        //$('.subBody').hide();bodyBuss
        $('#ajaxBusy').show();
    }).ajaxStop(function () {
        //$('.subBody').show();
        $('.content').removeClass('bodyBuss');
        $('#ajaxBusy').hide();
    });    
    reinit();
});
