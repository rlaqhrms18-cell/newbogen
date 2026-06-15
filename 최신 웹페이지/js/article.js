/* article.js — 정적 글 페이지 인터랙션 (목차/진행률/글자크기/공유) */
(function(){
  "use strict";
  var FONT_KEY="jisikchango_fontscale";
  var aBody=document.getElementById("aBody");
  var toc=document.getElementById("toc");
  var heads=aBody?Array.prototype.slice.call(aBody.querySelectorAll("h2, h3")):[];

  /* 목차 활성 표시 */
  if(toc && heads.length){
    var links=Array.prototype.slice.call(toc.querySelectorAll("a"));
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(en.isIntersecting){
          links.forEach(function(l){l.classList.remove("active");});
          var lk=toc.querySelector('a[href="#'+en.target.id+'"]');
          if(lk) lk.classList.add("active");
        }
      });
    },{rootMargin:"-70px 0px -70% 0px",threshold:0});
    heads.forEach(function(h){io.observe(h);});
  } else {
    var tb=document.getElementById("tocBox"); if(tb) tb.style.display="none";
  }

  /* 모바일 목차 접기 */
  var tocToggle=document.getElementById("tocToggle");
  var tocBox=document.getElementById("tocBox");
  if(tocToggle&&tocBox){
    if(window.matchMedia("(max-width: 899px)").matches) tocBox.classList.add("collapsed");
    tocToggle.addEventListener("click",function(){
      tocBox.classList.toggle("collapsed");
      tocToggle.setAttribute("aria-expanded", String(!tocBox.classList.contains("collapsed")));
    });
  }

  /* 읽기 진행률 */
  var progress=document.getElementById("readingProgress");
  function onScroll(){
    var docH=document.documentElement.scrollHeight-window.innerHeight;
    var pct=docH>0?(window.scrollY/docH)*100:0;
    if(progress) progress.style.width=Math.min(100,Math.max(0,pct))+"%";
  }
  window.addEventListener("scroll",onScroll,{passive:true}); onScroll();

  /* 글자 크기 */
  var scale=parseFloat(localStorage.getItem(FONT_KEY)||"1");
  function applyScale(){ document.documentElement.style.setProperty("--article-size",(17.5*scale).toFixed(1)+"px"); }
  applyScale();
  var up=document.getElementById("fontUp"), dn=document.getElementById("fontDown");
  if(up) up.addEventListener("click",function(){scale=Math.min(1.5,scale+0.1);localStorage.setItem(FONT_KEY,String(scale));applyScale();});
  if(dn) dn.addEventListener("click",function(){scale=Math.max(0.85,scale-0.1);localStorage.setItem(FONT_KEY,String(scale));applyScale();});

  /* 링크 복사 */
  var cp=document.getElementById("copyLink");
  if(cp) cp.addEventListener("click",function(){
    if(navigator.clipboard) navigator.clipboard.writeText(location.href);
    var o=cp.textContent; cp.textContent="✅ 복사됨";
    setTimeout(function(){cp.textContent=o;},1500);
  });
})();
