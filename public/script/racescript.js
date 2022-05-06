
var lc=document.querySelector('.leftContent');
var wc=document.querySelector('.wrongContent');
var dc=document.querySelector('.doneContent');
var x= document.querySelector("textarea");
const st=new Date();
function check(char) {
  return (/[a-zA-Z]/).test(char)
}
var wordCount=0;
x.addEventListener('keydown',function(e){

  console.log(e);
  if(e.key=='Backspace'){
    var wrong=wc.innerHTML;
    if(wrong.length!=0){
      lc.innerHTML=wc.innerHTML[wrong.length-1]+lc.innerHTML;
      wc.innerHTML=wrong.substr(0,wrong.length-1);
    }
    else if(dc.innerHTML.length!=0) {
      var done=dc.innerHTML;
      lc.innerHTML=done[done.length-1]+lc.innerHTML;
      dc.innerHTML=done.substr(0,done.length-1);
    }
    else {
      return;
    }
  }
  else if(e.key.length==1){
    addLetter(e.key);
  }

});
function addLetter( c){
  var wrong=wc.innerHTML;
  if(wrong.length!=0){
    if(lc.innerHTML.length!=0){
    wc.innerHTML=wc.innerHTML+lc.innerHTML[0];
    lc.innerHTML=lc.innerHTML.substr(1,lc.innerHTML.length-1);
  }

  }
  else {
    if(lc.innerHTML[0]==c){
      dc.innerHTML=dc.innerHTML+c;
      lc.innerHTML=lc.innerHTML.substr(1,lc.innerHTML.length-1);
      if(lc.innerHTML.length==0){
        const en=new Date();
        var  diff= (en.getTime()-st.getTime())/60000;
         //diff=Math.round(
         console.log(diff);
         diff=Math.round(diff*100+Number.EPSILON)/100; 
         var data = new URLSearchParams();
         data.append("time",diff);
         data.append("words",wordCount);
         var url="/racecomplete?"+data.toString();
         location.href=url;
        //window.location.href="/racecomplete/";
        return;
      }
      if(c==' '){
        x.value="";
        wordCount=wordCount+1;
      }
    }
    else{
      wc.innerHTML=lc.innerHTML[0];
      lc.innerHTML=lc.innerHTML.substr(1,lc.innerHTML.length-1);
    }
  }
}
