
var url;
var defaultsched;

function goto_app() {
    window.location.replace("main.html");
}

function save_default() {
    // The url is already saved
    var val = $("#selection").find('option:selected').text();
    localStorage['default']=val;
} 

function makeSelectorandSaveurl(data) {
    localStorage['url']=url;
    if (!defaultsched)
    {
       localStorage['default']="web";
    }
    // remove old selections
    $("#selection").empty();
    var o2=$("<option selected=\"true\">web</option>");
    $("#selection").append(o2);
    // remove the old selected
    // Now find the schedules and add them
    var a = data.split('\n');
    for (l in a) {
      var line = a[l].split(',');
      if (line[0] == "schedules") {
         var schednames = line.slice(1);
         for (l2 in schednames) {
             var o=$("<option>"+schednames[l2]+"</option>");
             $("#selection").append(o);
          }
    }
   }
}

function save_url() {
    
    url=$("#url").val();
    // get the actual web page
    $.get(url,makeSelectorandSaveurl);
}

function restore_options() {

    $("#save_url").click(save_url);
    // restore the url
    url=localStorage['url'];
    if (url) {
      $("#url").attr('value',url);
      // restore the default
      defaultsched = localStorage['default'];
    $.get(url,makeSelectorandSaveurl);
    }
}

window.onload=restore_options

