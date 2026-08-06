alert("JavaScript Loaded");

/* ===========================
   MOBILE MENU
=========================== */

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn) {
    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}

/* ===========================
   SCROLL ANIMATION
=========================== */

const hiddenElements = document.querySelectorAll(
    ".product-card,.category-card,.review-card,.contact-card,.about-content,.about-image"
);

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
});

hiddenElements.forEach(el => {
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

window.addEventListener("scroll", () => {

    if (window.scrollY > 400) {
        topBtn.style.display = "block";
    } else {
        topBtn.style.display = "none";
    }

});

topBtn.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

/* ===========================
   ACTIVE NAVIGATION
=========================== */

const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 120;

        if (window.scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }

    });

    navItems.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }

    });

});

/* ===========================
   CLOSE MENU WHEN LINK CLICKED
=========================== */

navItems.forEach(link => {

    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
    });

});
/* ===========================
   SEARCH ICON
=========================== */

const searchIcon = document.querySelector(".search-icon");

if (searchIcon) {

    searchIcon.addEventListener("click", () => {

        alert("Search feature coming soon!");

    });

}

/* ===========================
   SHOPPING CART
=========================== */

const cartIcon = document.querySelector(".cart-icon");
const cartPanel = document.querySelector(".cart-panel");
const closeCart = document.getElementById("close-cart");

const cartButtons = document.querySelectorAll(".cart-btn");

const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");

let cart = [];

if (cartIcon) {

    cartIcon.addEventListener("click", () => {

        cartPanel.classList.add("active");

    });

}

if (closeCart) {

    closeCart.addEventListener("click", () => {

        cartPanel.classList.remove("active");

    });

}

cartButtons.forEach(button => {

    button.addEventListener("click", () => {

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

    cartItems.innerHTML = `
        <div style="
            color:black;
            padding:20px;
            border:2px solid red;
            background:yellow;
        ">
            <h2>TEST ITEM</h2>
            <p>This should be visible.</p>
        </div>
    `;

    cartTotal.textContent = "$999";
    cartCount.textContent = "1";

}
    