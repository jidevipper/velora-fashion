/* ===========================
   MOBILE MENU
=========================== */

const menuBtn = document.querySelector(".menu-btn");

const navLinks = document.querySelector(".nav-links");

menuBtn.addEventListener("click",()=>{

navLinks.classList.toggle("active");

});


/* ===========================
   SCROLL ANIMATION
=========================== */

const hiddenElements = document.querySelectorAll(

".product-card,.category-card,.review-card,.contact-card,.about-content,.about-image"

);

const observer = new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

});

hiddenElements.forEach(el=>{

el.classList.add("hidden");

observer.observe(el);

});