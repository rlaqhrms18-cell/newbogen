/* site.js — 공통: 테마 토글 + 연도 (정적 페이지용) */
(function(){
  "use strict";
  var KEY="jisikchango_theme";
  function apply(t){
    document.documentElement.setAttribute("data-theme",t);
    var b=document.getElementById("themeToggle");
    if(b) b.textContent = t==="light"?"☀️":"🌙";
  }
  var t=localStorage.getItem(KEY);
  if(!t) t=(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches)?"light":"dark";
  apply(t);
  document.addEventListener("click",function(e){
    if(e.target&&e.target.id==="themeToggle"){
      var cur=document.documentElement.getAttribute("data-theme");
      var n=cur==="light"?"dark":"light";
      localStorage.setItem(KEY,n); apply(n);
    }
  });
  document.addEventListener("DOMContentLoaded",function(){
    var y=document.getElementById("year");
    if(y) y.textContent=new Date().getFullYear();
  });
})();
