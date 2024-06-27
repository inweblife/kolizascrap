const navLinks = document.querySelector('.nav__links');

const showMenu = () => {
    navLinks.classList.toggle('show');
}

document.getElementById('year').textContent = new Date().getFullYear();