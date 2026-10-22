(function(){
  "use strict";
  // "Ask for rates" buttons preselect the room in the request form.
  var sel=document.getElementById("room");
  document.querySelectorAll("[data-room]").forEach(function(a){
    a.addEventListener("click",function(){ if(sel) sel.value=a.getAttribute("data-room"); });
  });
  // Check-out can't be before check-in.
  var ci=document.getElementById("checkin"), co=document.getElementById("checkout");
  if(ci&&co){
    var t=new Date(); t.setMinutes(t.getMinutes()-t.getTimezoneOffset());
    ci.min=co.min=t.toISOString().slice(0,10);
    ci.addEventListener("change",function(){ co.min=ci.value||co.min; if(co.value&&co.value<ci.value) co.value=ci.value; });
  }
})();
