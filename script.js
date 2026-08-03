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

/* ===========================
   BACK TO TOP BUTTON
=========================== */

const topBtn = document.createElement("button");

topBtn.id = "topBtn";

topBtn.innerHTML = "↑";

document.body.appendChild(topBtn);

window.addEventListener("scroll",()=>{

if(window.scrollY>400){

topBtn.style.display="block";

}else{

topBtn.style.display="none";

}

});

topBtn.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});


/* ===========================
   ACTIVE NAVIGATION
=========================== */

const sections=document.querySelectorAll("section");

const navItems=document.querySelectorAll(".nav-links a");

window.addEventListener("scroll",()=>{

let current="";

sections.forEach(section=>{

const sectionTop=section.offsetTop-120;

const sectionHeight=section.clientHeight;

if(scrollY>=sectionTop){

current=section.getAttribute("id");

}

});

navItems.forEach(link=>{

link.classList.remove("active");

if(link.getAttribute("href")==="#" + current){

link.classList.add("active");

}

});

});


/* ===========================
   SMOOTH CLOSE MENU
=========================== */

navItems.forEach(link=>{

link.addEventListener("click",()=>{

navLinks.classList.remove("active");

});

});


// ==========================
// SHOPPING CART
// ==========================

const cartIcon = document.querySelector(".cart-icon");

const cartPanel = document.querySelector(".cart-panel");

const closeCart = document.getElementById("close-cart");

const cartButtons = document.querySelectorAll(".cart-btn");

const cartItems = document.getElementById("cart-items");

const cartTotal = document.getElementById("cart-total");

const cartCount = document.getElementById("cart-count");

let cart = [];

cartIcon.addEventListener("click",()=>{

cartPanel.classList.add("active");

});

closeCart.addEventListener("click",()=>{

cartPanel.classList.remove("active");

});

cartButtons.forEach(button=>{

button.addEventListener("click",()=>{

const name = button.dataset.name;

const price = Number(button.dataset.price);

cart.push({

name,

price

});

updateCart();

});

});

function updateCart() {

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        total += item.price;

        cartItems.innerHTML += `
            <div class="cart-item">
                <h4>${item.name}</h4>
                <p>$${item.price}</p>
            </div>
        `;

    });

    if (cart.length === 0) {

        cartItems.innerHTML = "<p>Your cart is empty.</p>";

    }

    cartTotal.textContent = "$" + total;

    cartCount.textContent = cart.length;

}
