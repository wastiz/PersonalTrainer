document.addEventListener("DOMContentLoaded", function () {
    const bottomSections = `
    <div class="section-block tracker-right-top-to-bottom-clip flex flex-row flex-center gap-5">
        <div>
            <h5>Calories</h5>
            <label for="">Consumed</label>
            <p>300cal</p>
            <label>Remaining</label>
            <p>170 cal</p>
        </div>
        <img width="30%" src="img/icons/calories.png" alt="form">
    </div>
    <div class="section-block tracker-bottom-to-top-clip flex flex-row flex-center gap-5">
        <div>
            <h5>Current training plan</h5>
            <label>Type</label>
            <p>Muscle gaining</p>
        </div>
        <img src="img/icons/project.png" alt="training plan" width="100" height="100">
    </div>
    <div class="section-block tracker-top-to-bottom-clip flex flex-row flex-center gap-5">
        <div>
            <h5>Total trains</h5>
            <label for="">This week</label>
            <p>6h</p>
            <label>Previous</label>
            <p>2h</p>
        </div>
        <div class="outline-border">
            37 hours
        </div>
    </div>
`;

    const rightSections = `
    <div class="section-block tracker-bottom-left-to-top-clip flex flex-row">
        <div>
            <h5>Weekly form</h5>
            <p>Please, fill the form, so we could analyze your results)</p>
            <button class="btn btn-primary">Start filling</button>
        </div>
        <img width="70%" height="70%" src="img/icons/contact-form.png" alt="form">
    </div>
    <div class="section-block tracker-left-to-right-clip"></div>
    <div class="section-block tracker-right-to-left-clip"></div>
    <div class="section-block tracker-top-to-right-clip"></div>
    `;

    const sectionsContent = ['calories', 'training-plan', 'total-trainings', 'weekly-form', 'idk', 'idk2', 'idk3'];
    const tabContent = document.querySelector('.tab-content');
    const bottomSection = document.querySelector('.bottom-sections');
    const rightSection = document.querySelector('.right-block');

    function addClickHandlers() {
        const sections = document.querySelectorAll('.section-block'); // переинициализация элементов
        sections.forEach((section, index) => {
            section.addEventListener('click', async () => {
                console.log('clicked');
                try {
                    const response = await fetch(`/fitness-tracker/${sectionsContent[index]}`);
                    tabContent.innerHTML = await response.text();
                    sections.forEach(section => section.classList.remove('active-section'));
                    section.classList.add('active-section');
                } catch (err) {
                    console.error('Error loading section:', err);
                }
            });
        });
    }

    function updateSections() {
        if (window.innerWidth < 768) {
            bottomSection.innerHTML = bottomSections + rightSections;
            rightSection.innerHTML = '';
        } else if (window.innerWidth >= 768 && window.innerWidth < 1470) {
            rightSection.innerHTML = bottomSections + rightSections;
            bottomSection.innerHTML = '';
        } else if (window.innerWidth >= 1470) {
            rightSection.innerHTML = rightSections;
            bottomSection.innerHTML = bottomSections;
        }

        addClickHandlers();
    }

    updateSections();

    window.addEventListener('resize', updateSections);
});
