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
        <div class="section-block tracker-bottom-left-to-top-clip flex flex-row active-section">
            <div>
                <h5>Weekly form</h5>
                <p>Please, fill the form, so we could analyze your results)</p>
                <button class="btn btn-primary">Start filling</button>
            </div>
            <img width="70%" height="70%" src="img/icons/contact-form.png" alt="form">
        </div>
        <div class="section-block tracker-left-to-right-clip flex flex-row">
            <div>
                <h5>Body results</h5>
                <p>See your body results in graphs</p>
                <button class="btn btn-primary">Watch</button>
            </div>
            <img width="70%" height="70%" src="img/icons/growth.png" alt="formik">
        </div>
        <div class="section-block tracker-right-to-left-clip flex flex-row">
            <div>
                <h5>Strength measurements</h5>
                <p>Fill your power measurements, so we could analyze more</p>
                <button class="btn btn-primary">Start filling</button>
            </div>
            <img width="70%" height="70%" src="img/icons/contact-form.png" alt="formik">
        </div>
        <div class="section-block tracker-top-to-right-clip flex flex-row">
            <div>
                <h5>Strength results</h5>
                <p>See your strength results in graphs</p>
                <button class="btn btn-primary">Watch</button>
            </div>
            <img width="40%" height="60%" src="img/icons/growth.png" alt="formik">
        </div>
    `;

    const sectionsContent = ['calories', 'training-plan', 'total-trainings', 'weekly-body-form', 'body-results', 'weekly-strength-form', 'strength-results'];
    const tabContent = document.querySelector('.tab-content');
    const bottomSection = document.querySelector('.bottom-sections');
    const rightSection = document.querySelector('.right-block');

    function addClickHandlers() {
        const sections = document.querySelectorAll('.section-block');
        sections.forEach((section, index) => {
            section.addEventListener('click', async () => {
                console.log('clicked');
                try {
                    const response = await fetch(`/fitness-tracker/${sectionsContent[index]}`);
                    tabContent.innerHTML = await response.text();
                    sections.forEach(section => section.classList.remove('active-section'));
                    section.classList.add('active-section');
                    if (sectionsContent[index] === 'body-results') {
                        await initializeBodyCharts();
                    }
                    if (sectionsContent[index] === 'strength-results') {
                        await initializeStrengthCharts();
                    }
                    if (sectionsContent[index] === 'weekly-body-form') {
                        addFormSubmitListener('.weekly-body-form', 'body-form-modal', '.body-form-modal-text', 'http://localhost:3002/fitness-tracker/submit-body-data');
                    }
                    if (sectionsContent[index] === 'weekly-strength-form') {
                        addFormSubmitListener('.weekly-strength-form', 'strength-form-modal', '.strength-form-modal-text', 'http://localhost:3002/fitness-tracker/submit-strength-data');
                    }
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



    //Login and forms fetches

    const loginResponse = document.querySelector('.login-response');
    const loginModal = document.querySelector('#login-modal');

    const token = localStorage.getItem('token');
    if (token) {
        loginModal.style.display = 'none';
    }

    document.querySelector('.login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        loginResponse.innerHTML = 'Login...';

        try {
            const formData = new FormData(e.target);
            const data = {
                email: formData.get('login-mail'),
                password: formData.get('login-pass'),
            };

            const response = await fetch('http://localhost:3002/fitness-tracker/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                localStorage.setItem('token', jsonResponse.token);
                localStorage.setItem('email', data.email)
                loginResponse.innerHTML = 'Successfully logged in';
                loginModal.style.display = 'none';
            } else if (response.status === 401) {
                loginResponse.innerHTML = 'Email or password is incorrect. Try again';
            } else {
                loginResponse.innerHTML = 'Server Error. Try again later';
            }
        } catch (e) {
            console.error(e);
            loginResponse.innerHTML = 'An error occurred. Please try again later';
        }
    });

    document.querySelector('.btn-logout').addEventListener('click', () => {
        localStorage.removeItem('token')
        localStorage.removeItem('email')
        location.reload()
    })


    function addFormSubmitListener(formSelector, modalSelector, modalTextSelector, url) {
        document.querySelector(formSelector).addEventListener('submit', async (e) => {
            e.preventDefault();

            const infoText = document.querySelector(modalTextSelector);
            const modal = new bootstrap.Modal(document.getElementById(modalSelector));

            try {
                infoText.innerHTML = 'Sending...';
                const formData = new FormData(e.target);
                const data = {
                    email: localStorage.getItem('email')
                };

                formData.forEach((value, key) => {
                    data[key] = +value;  // Преобразование значений формы в числа
                });

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    infoText.innerHTML = 'Data was sent successfully';
                } else {
                    infoText.innerHTML = 'Sorry. Error occurred, try again later';
                }

                modal.show();

            } catch (error) {
                console.error(error);
                infoText.innerHTML = 'An unexpected error occurred';
                modal.show();
            }
        });
    }



    async function initializeBodyCharts() {
        try {
            const response = await fetch('http://localhost:3002/fitness-tracker/get-body-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: localStorage.getItem('email') })
            });

            const data = await response.json();

            const bodyParts = ['height', 'weight', 'waist', 'chest', 'shoulders', 'biceps', 'forearms', 'neck', 'hips', 'calves'];

            bodyParts.forEach(part => {
                createChart(part, data);
            });
        } catch (e) {
            console.error('Error initializing body charts:', e);
        }
    }


    async function initializeStrengthCharts() {
        try {
            const response = await fetch('http://localhost:3002/fitness-tracker/get-strength-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: localStorage.getItem('email') })
            });
            const data = await response.json();

            const strengthParts = ['bench_press_wide', 'bench_press_narrow', 'bicep_curl', 'bent_over_one_arm_row', 'deadlift', 'squats'];

            strengthParts.forEach(part => {
                createChart(part, data);
            });
        } catch (e) {
            console.error('Error initializing strength charts:', e);
        }
    }


    function createChart(bodyPart, data) {
        const ctx = document.getElementById(`${bodyPart}-chart`).getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => new Date(item.measurement_date).toLocaleDateString()),  // Метки времени (даты)
                datasets: [{
                    label: `${bodyPart} measurements`,
                    data: data.map(item => item[bodyPart]),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }


});
