
let btn =document.querySelectorAll(".auth-buttons");
console.log(btn);
btn[0].addEventListener("click",()=>{
  window.location.href="/login";
});
btn[1].addEventListener("click",()=>{
  window.location.href="/signup";
});
