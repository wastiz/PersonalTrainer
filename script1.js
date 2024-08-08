document.addEventListener("DOMContentLoaded", function() {
    const navbar = document.querySelector('.navbar');
    const fixedTopContent = document.querySelector('.fixed-top-content');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const carousel = document.getElementById('carouselExampleIndicators');
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

    function handleScroll() {
        const scrollPosition = window.pageYOffset;
        const navbarBottom = navbar.offsetTop + navbar.offsetHeight;

        // Adjust navbar to fix to the top when scrolling past the navbar's bottom
        if (scrollPosition >= navbarBottom) {
            navbar.classList.add('fixed-top');
            fixedTopContent.style.display = 'flex'; // Show the logo and text
        } else {
            navbar.classList.remove('fixed-top');
            fixedTopContent.style.display = 'none'; // Hide the logo and text
        }

        updateNavLinkHighlights();
        scrollTopBtn.style.display = (scrollPosition > 500) ? 'block' : 'none';
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    scrollTopBtn.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', handleScroll);

    // Initialize nav link highlights
    updateNavLinkHighlights();
});
