/* home.js — 정적 홈: 검색 + 카테고리 필터 */
(function(){
  "use strict";
  var input=document.getElementById("searchInput");
  var cards=Array.prototype.slice.call(document.querySelectorAll(".post-card"));
  var chips=Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var empty=document.getElementById("emptyState");
  var activeCat="전체", q="";

  function apply(){
    var shown=0;
    cards.forEach(function(c){
      var okCat = activeCat==="전체" || c.getAttribute("data-cat")===activeCat;
      var okQ = !q || (c.getAttribute("data-title")||"").toLowerCase().indexOf(q)!==-1;
      var vis=okCat&&okQ;
      c.style.display=vis?"":"none";
      if(vis) shown++;
    });
    if(empty) empty.hidden = shown!==0;
  }
  if(input) input.addEventListener("input",function(){q=input.value.trim().toLowerCase();apply();});
  chips.forEach(function(ch){
    ch.addEventListener("click",function(){
      chips.forEach(function(x){x.classList.remove("active");});
      ch.classList.add("active");
      activeCat=ch.getAttribute("data-cat"); apply();
    });
  });
  /* 사이드바 카테고리 클릭 → 동일 필터 */
  Array.prototype.slice.call(document.querySelectorAll("#catList a")).forEach(function(a){
    a.addEventListener("click",function(e){
      e.preventDefault();
      var c=a.getAttribute("data-cat");
      chips.forEach(function(x){x.classList.toggle("active", x.getAttribute("data-cat")===c);});
      activeCat=c; apply(); window.scrollTo({top:0,behavior:"smooth"});
    });
  });
})();
