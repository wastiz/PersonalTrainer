document.addEventListener("DOMContentLoaded", function () {
    const bottomSections = `
    <div class="section-block calorie-section flex flex-row flex-center gap-5">
        <div>
            <h5>Calories</h5>
            <label for="">Consumed</label>
            <p>300cal</p>
            <label>Remaining</label>
            <p>170 cal</p>
        </div>
        <img width="30%" src="img/icons/calories.png" alt="form">
    </div>
    <div class="section-block training-plan-section flex flex-row flex-center gap-5">
        <div>
            <h5>Current training plan</h5>
            <label>Type</label>
            <p>Muscle gaining</p>
        </div>
        <img src="img/icons/project.png" alt="training plan" width="100" height="100">
    </div>
    <div class="section-block total-trains-section flex flex-row flex-center gap-5">
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
        <div class="section-block weekly-body-form-section flex flex-row flex-center active-section">
            <div>
                <h5>Weekly form</h5>
                <p>Please, fill the form, so we could analyze your results)</p>
                <button class="btn btn-primary">Start</button>
            </div>
            <img width="70%" height="70%" src="img/icons/contact-form.png" alt="form">
        </div>
        <div class="section-block body-results-section flex flex-row">
            <div>
                <h5>Body results</h5>
                <p>See your body results in graphs</p>
                <button class="btn btn-primary">Watch</button>
            </div>
            <img width="70%" height="70%" src="img/icons/growth.png" alt="formik">
        </div>
        <div class="section-block weekly-strength-form-section flex flex-row">
            <div>
                <h5>Strength form</h5>
                <p>Please, fill the form, so we could analyze your results)</p>
                <button class="btn btn-primary">Start</button>
            </div>
            <img width="70%" height="70%" src="img/icons/contact-form.png" alt="form">
        </div>
        <div class="section-block strength-results-section flex flex-row">
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
    const bottomSection = document.querySelector('.bottom-block');
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
                        addFormSubmitListener('.weekly-body-form','http://localhost:3002/fitness-tracker/submit-body-data');
                    }
                    if (sectionsContent[index] === 'weekly-strength-form') {
                        addFormSubmitListener('.weekly-strength-form','http://localhost:3002/fitness-tracker/submit-strength-data');
                    }
                    if (sectionsContent[index] === 'total-trainings') {
                        await initializeTrainingSection();
                    }
                    if (sectionsContent[index] === 'calories') {
                        await initializeCalorieSection();
                    }
                } catch (err) {
                    console.error('Error loading section:', err);
                }
            });
        });
    }


    function updateSections() {
        if (window.innerWidth < 1170) {
            bottomSection.innerHTML = bottomSections + rightSections;
            rightSection.innerHTML = '';
        } else if (window.innerWidth >= 1170 && window.innerWidth < 1470) {
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


    function addFormSubmitListener(formSelector, url) {
        document.querySelector(formSelector).addEventListener('submit', async (e) => {
            e.preventDefault();

            const modal = createModal();

            document.body.appendChild(modal);

            const bsModal = new bootstrap.Modal(modal);

            const infoText = modal.querySelector('.modal-body');

            try {
                infoText.innerHTML = 'Sending...';
                const formData = new FormData(e.target);
                const data = {
                    email: localStorage.getItem('email')
                };

                formData.forEach((value, key) => {
                    data[key] = +value;
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

                bsModal.show();

                modal.addEventListener('hidden.bs.modal', () => {
                    modal.remove();
                });

            } catch (error) {
                console.error(error);
                infoText.innerHTML = 'An unexpected error occurred';
                bsModal.show();

                modal.addEventListener('hidden.bs.modal', () => {
                    modal.remove();
                });
            }
        });
    }

    function createModal() {
        const modal = document.createElement('div');
        modal.classList.add('modal', 'fade');
        modal.id = 'dynamicModal';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', 'dynamicModalLabel');
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title text-black" id="dynamicModalLabel">Submission Status</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-black">
                    ...
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;

        return modal;
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

    async function initializeTrainingSection() {
        const email = localStorage.getItem('email');
        // Добавляем обработчик для изменения плана тренировок
        document.querySelector('#btn-change-training-plan').addEventListener('click', (e) => {
            const daysOfWeekButtons = document.querySelectorAll('#days-of-week button');
            const selectedDays = new Set();
            console.log(daysOfWeekButtons);
            daysOfWeekButtons.forEach(button => {
                button.addEventListener('click', function () {
                    console.log('cloked item')
                    const day = this.getAttribute('data-day');
                    if (selectedDays.has(day)) {
                        selectedDays.delete(day);
                        this.classList.remove('btn-primary');
                        this.classList.add('btn-outline-primary');
                    } else {
                        selectedDays.add(day);
                        this.classList.remove('btn-outline-primary');
                        this.classList.add('btn-primary');
                    }
                });
            });

            // Обработчик для отправки нового плана тренировок
            document.getElementById('training-plan-form').addEventListener('submit', async (e) => {
                e.preventDefault();

                const sessionDuration = document.getElementById('sessionDuration').value;

                const trainingDays = Array.from(selectedDays).join(', ');

                const response = await fetch('/set-training-plan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: localStorage.getItem('email'), days: trainingDays, duration: sessionDuration })
                });

                if (response.ok) {
                    alert('Training plan updated successfully!');
                    selectedDays.clear();
                    daysOfWeekButtons.forEach(button => {
                        button.classList.remove('btn-primary');
                        button.classList.add('btn-outline-primary');
                    });
                    document.getElementById('sessionDuration').value = '';
                    // Обновляем секцию тренировок после успешного обновления
                    initializeTrainingSection();
                } else {
                    console.error('Error updating training plan.');
                }
            });
        });

        const { weekDays, totalSessionsHours, streak } = await getUserTrainingData(email);

        // Проверяем, если данные о тренировках отсутствуют
        if (!weekDays || weekDays.length === 0) {
            document.getElementById('user-weeks-buttons').innerHTML = '<p>Please create a training plan to get started!</p>';
            document.getElementById('total-sessions').innerText = '0';
            document.getElementById('total-hours').innerText = '0';
            return; // Выходим из функции, так как нет данных
        }

        console.log(weekDays, totalSessionsHours, streak);

        // Обновляем значения для сессий и часов
        document.getElementById('total-sessions').innerText = totalSessionsHours || '0';
        document.getElementById('total-hours').innerText = streak || '0';

        // Генерируем кнопки для дней недели
        weekDays.forEach(item => {
            const button = document.createElement('button');
            button.innerText = item.week_day;
            button.classList.add('btn', 'btn-primary');
            button.id = item.id;
            button.disabled = item.attended;
            button.addEventListener('click', () => handleDayButtonClick(item.id));
            document.getElementById('user-weeks-buttons').append(button);
        });
    }

    async function getUserTrainingData(email) {
        const response = await fetch('/get-user-training-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.message) {
                alert(data.message);
            }
            return data;
        } else {
            console.error('Error retrieving training data:', data.error);
        }
    }

    async function handleDayButtonClick(dayId) {
        const email = localStorage.getItem('email');

        const response = await fetch('/mark-training-attended', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, dayId })
        });

        if (response.ok) {
            const button = document.getElementById(dayId);
            button.disabled = true; // Отключаем кнопку после нажатия
            const totalSessions = await getTotalSessions(email);
            const totalHours = await getTotalHours(email);
            document.getElementById('total-sessions').innerText = totalSessions;
            document.getElementById('total-hours').innerText = totalHours;
        } else {
            alert('Error marking training as attended.');
        }
    }

    async function initializeCalorieSection() {

        document.querySelector('#btn-change-calorie-plan').addEventListener('click', () => {
            document.getElementById('calorie-plan-form').addEventListener('submit', async (e) => {
                e.preventDefault();

                const email = localStorage.getItem('email');
                const daily_calorie_goal = document.getElementById('calorieGoal').value;

                const response = await fetch('/set-calorie-plan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, daily_calorie_goal })
                });

                if (response.ok) {
                    alert('Calorie plan updated successfully!');
                    document.getElementById('calorieGoal').value = '';
                    const modal = bootstrap.Modal.getInstance(document.getElementById('caloriePlanModal'));
                    modal.hide();
                    initializeCalorieSection(); // Обновление графика
                } else {
                    console.error('Error updating calorie plan.');
                }
            });
        })


        document.querySelector('#add-calorie-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = localStorage.getItem('email');
            const calories = parseInt(document.querySelector('#calorie-add-input').value);

            const response = await fetch('/add-calories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, calories })
            });

            if (response.ok) {
                alert('Calorie entry added successfully')   ;
                initializeCalorieSection();
            } else {
                console.error('Error adding calorie entry.');
            }
        });

        document.getElementById('calorie-plan-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = localStorage.getItem('email');
            const daily_calorie_goal = document.getElementById('calorieGoal').value;

            const response = await fetch('/set-calorie-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, daily_calorie_goal })
            });

            if (response.ok) {
                alert('Calorie plan updated successfully!');
                document.getElementById('calorieGoal').value = '';
                const modal = bootstrap.Modal.getInstance(document.getElementById('caloriePlanModal'));
                modal.hide();
                initializeCalorieSection(); // Обновление графика
            } else {
                console.error('Error updating calorie plan.');
            }
        });


        const email = localStorage.getItem('email');
        const response = await fetch('/get-calorie-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            const { dailyGoal, calorieData } = await response.json();
            const labels = calorieData.map(entry => entry.entry_date);
            const data = calorieData.map(entry => entry.calories);

            console.log(data, dailyGoal)

            document.querySelector('#consumed-calories').innerText = "Calorie consumed today: " + data[data.length - 1];
            document.querySelector('#remained-calories').innerText = "Remained calories: " +(dailyGoal - parseInt(data[data.length - 1]));



            const ctx = document.getElementById('calorie-chart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Calories consumed',
                        data,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: { y: { beginAtZero: true } },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                afterBody: () => `Daily goal: ${dailyGoal} calories`
                            }
                        }
                    }
                }
            });
        } else {
            console.error('Error fetching calorie data.');
        }
    }

    function createChart(bodyPart, data) {
        const ctx = document.getElementById(`${bodyPart}-chart`).getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => new Date(item.measurement_date).toLocaleDateString()),
                datasets: [{
                    label: `${bodyPart} measurements`,
                    data: data.map(item => item[bodyPart]),
                    fill: false,
                    tension: 0.1,
                    borderColor: 'yellow', // Цвет линии
                    backgroundColor: 'rgba(255, 99, 132, 0.2)', // Цвет заливки (если fill: true)
                    pointBackgroundColor: 'yellow', // Цвет точек на линии
                    pointBorderColor: 'yellow', // Цвет границы точек
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
