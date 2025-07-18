const navbar = document.querySelector('.navbar');
const fixedTopContent = document.querySelector('.fixed-top-content');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
const counters = document.querySelectorAll('.info-block h2');
const animationSpeed = 2000;
const scrollTopBtn = document.getElementById('scrollTopBtn');

function clearHighlights() {
    navLinks.forEach(link => link.classList.remove('nav-highlight'));
}

function updateNavLinkHighlights() {
    const scrollPosition = window.pageYOffset + navbar.offsetHeight;
    let foundSection = false;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - navbar.offsetHeight;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            clearHighlights();
            const matchingLink = Array.from(navLinks).find(link => section.id && link.getAttribute('href').includes(section.id));
            if (matchingLink) {
                matchingLink.classList.add('nav-highlight');
                foundSection = true;
            }
        }
    });

    if (!foundSection && scrollPosition < sections[0].offsetTop - navbar.offsetHeight) {
        clearHighlights();
        navLinks[0].classList.add('nav-highlight');
    }
}

const navCollapse = document.querySelector('.navbar-collapse');

navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
        if (navCollapse.classList.contains('show')) {
            const bsCollapse = new bootstrap.Collapse(navCollapse, {
                toggle: true
            });
        }
    });
});

function handleScroll() {
    const scrollPosition = window.pageYOffset;
    const navbarBottom = navbar.offsetTop + navbar.offsetHeight;

    if (scrollPosition >= navbarBottom) {
        navbar.classList.add('fixed-top');
        fixedTopContent.style.display = 'flex';
    } else {
        navbar.classList.remove('fixed-top');
        fixedTopContent.style.display = 'none';
    }

    updateNavLinkHighlights();
    scrollTopBtn.style.display = (scrollPosition > 500) ? 'block' : 'none';
}

function animateCounters() {
    counters.forEach(counter => {
        if (!counter.classList.contains('visible')) {
            counter.classList.add('visible');
            const target = +counter.getAttribute('data-target');
            const increment = target / animationSpeed;
            let currentValue = 0;

            const updateCounter = () => {
                currentValue += increment * 10; // Update increment speed
                counter.textContent = Math.floor(currentValue);

                if (currentValue < target) {
                    setTimeout(updateCounter, 10);
                } else {
                    counter.textContent = counter.textContent.includes('+') ? target + '+' : target;
                }
            };

            setTimeout(updateCounter, 10);
        }
    });
}

const onScrollAnimate = () => {
    const section = document.querySelector('.info-section');
    const sectionPos = section.getBoundingClientRect().top;
    const screenPos = window.innerHeight / 1.3;

    if (sectionPos < screenPos) {
        animateCounters();
        document.removeEventListener('scroll', onScrollAnimate);
    }
};

document.addEventListener('scroll', onScrollAnimate);

window.addEventListener('load', onScrollAnimate);

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function scrollToElement(target) {
    const element = document.getElementById(target);
    element.scrollIntoView({ behavior: "smooth", block: "start" });
}

function goToForm(trainingType) {
    scrollToElement("personal-training");
    const selectElement = document.getElementById("training-type-selector");
    selectElement.value = trainingType;
}

function goToTracker () {
    window.location.href = '/fitness-tracker'
}

window.addEventListener('scroll', () => {
    localStorage.setItem('scrollPosition', window.scrollY);
});

window.addEventListener('load', () => {
    const savedPosition = localStorage.getItem('scrollPosition');
    if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition, 10));
    }
});

scrollTopBtn.addEventListener('click', scrollToTop);
window.addEventListener('scroll', handleScroll);

updateNavLinkHighlights();