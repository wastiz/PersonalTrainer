document.addEventListener("DOMContentLoaded", function() {
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
        const screenPos = window.innerHeight / 1.3; // Trigger earlier before reaching the top of the viewport

        if (sectionPos < screenPos) {
            animateCounters();
            document.removeEventListener('scroll', onScrollAnimate); // Remove event listener if no need to repeat the animation
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

    scrollTopBtn.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', handleScroll);

    updateNavLinkHighlights();

    $('#exampleModal').on('shown.bs.modal', function () {
        calendar.updateSize();
    });

    document.querySelectorAll('.fc-daygrid-day-frame').forEach(item => {
        item.addEventListener('click', function (e) {
            console.log('clicked');
        })
    })

});
