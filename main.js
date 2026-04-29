const navLinks = document.querySelector('.nav__links');

const showMenu = () => {
    navLinks.classList.toggle('show');
}

document.getElementById('year').textContent = new Date().getFullYear();

function sendMail() {
    const user = "admin";
    const domain = "ecometal.bg";
    const a = document.createElement('a');
    a.href = "mailto:" + user + "@" + domain;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}