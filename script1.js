document.addEventListener("DOMContentLoaded", function() {
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const carousel = document.getElementById('carouselExampleIndicators');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    function clearHighlights() {
        navLinks.forEach(link => link.classList.remove('nav-highlight'));
    }

    function handleScroll() {
        const scrollOffset = 100;
        const scrollPosition = window.pageYOffset + navbar.offsetHeight + scrollOffset;
        const carouselBottom = carousel ? carousel.offsetHeight : 0;

        if (scrollPosition > carouselBottom) {
            navbar.classList.add('fixed-top');
        } else {
            navbar.classList.remove('fixed-top');
        }

        let inSection = false;

        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop - navbar.offsetHeight + scrollOffset;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navbar.classList.add('navbar-active'); // Add CSS class for active background
                clearHighlights();
                const matchingLink = Array.from(navLinks).find(link => link.getAttribute('href').includes(section.id));
                if (matchingLink) {
                    matchingLink.classList.add('nav-highlight');
                }
                inSection = true;
            }
        });

        if (!inSection) {
            navbar.classList.remove('navbar-active'); // Remove CSS class if not in any section
        }

        scrollTopBtn.style.display = (window.pageYOffset > 500) ? 'block' : 'none';
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    scrollTopBtn.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', handleScroll);

    // Carousel animation handling
    var activeCaption = document.querySelector('.carousel-item.active .carousel-caption');
    activeCaption.classList.add('active');

    carousel.addEventListener('slid.bs.carousel', function () {
        var activeItem = document.querySelector('.carousel-item.active');
        var allCaptions = document.querySelectorAll('.carousel-caption');

        // Remove active class from all captions
        allCaptions.forEach(function(caption) {
            caption.classList.remove('active');
        });

        // Add active class to the current caption
        var activeCaption = activeItem.querySelector('.carousel-caption');
        activeCaption.classList.add('active');
    });
});
