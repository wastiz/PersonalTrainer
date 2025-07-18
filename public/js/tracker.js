document.addEventListener("DOMContentLoaded", function () {
    const email = localStorage.getItem('email');

    fetch('/get-user-dashboard-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);

            const { dailyGoal, calorieData, weekDays, totalSessionsHours, streak, bmi } = data;

            const calories = calorieData.map(entry => entry.calories);
            const lastCalories = isNaN(calories[calories.length - 1]) ? 0 : calories[calories.length - 1];
            updateCalories(lastCalories ?? 0, (dailyGoal - parseInt(lastCalories)) ?? 0);

            document.getElementById('trainings-this-week').textContent = `${totalSessionsHours.sessions || 0}`;
            document.getElementById('trainings-previous').textContent = `${totalSessionsHours.hours || 0}h`;
            document.getElementById('total-trainings-hours').textContent = `${streak || 0} in a row`;

            document.getElementById('bmiResult').innerHTML = `${bmi ?? 0} (${getBmiCategory(bmi)})`;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    function updateCalories(consumed, remaining) {
        document.getElementById('calories-consumed').textContent = `${consumed} cal`;
        document.getElementById('calories-remaining').textContent = `${remaining} cal`;
    }

    function getBmiCategory(bmi) {
        if (bmi < 16)
            return `<span style="color: rgba(255, 150, 150, 1);">Tervisele ohtlik alakaal</span>`;
        else if (bmi >= 16 && bmi <= 18.5)
            return `<span style="color: rgba(255, 150, 150, 1);">Alakaal</span>`;
        else if (bmi > 18.5 && bmi <= 25)
            return `<span style="color: orange;">Normaalkaal</span>`;
        else if (bmi > 25 && bmi <= 30)
            return `<span style="color: rgba(255, 0, 0, 1);">Ülekaal</span>`;
        else if (bmi > 30 && bmi <= 35)
            return `<span style="color: rgba(255, 0, 0, 1);">Rasvumine</span>`;
        else if (bmi > 35 && bmi <= 40)
            return `<span style="color: rgba(139, 0, 0, 1);">Tugev rasvumine</span>`;
        else
            return `<span style="color: rgba(139, 0, 0, 1);">Tervisele ohtlik rasvumine</span>`;
    }


    // const activeSection = sessionStorage.getItem('activeSection');
    // if (activeSection) {
    //     const activeElement = document.querySelector(`.${activeSection}-section`);
    //     if (activeElement) {
    //         activeElement.classList.add('active');
    //     }
    // }
    //
    // const sections = document.querySelectorAll('.section-block');
    // sections.forEach(section => {
    //     section.addEventListener('click', function () {
    //         sections.forEach(s => s.classList.remove('active'));
    //         this.classList.add('active');
    //
    //         const sectionClass = this.classList[0];
    //         sessionStorage.setItem('activeSection', sectionClass.split('-')[0]);
    //     });
    // });

    window.addEventListener('beforeunload', () => {
        const scrollPosition = document.querySelector('.sidebar').scrollLeft;
        sessionStorage.setItem('scrollPosition', scrollPosition);
    });

    window.addEventListener('load', () => {
        const scrollPosition = sessionStorage.getItem('scrollPosition');
        if (scrollPosition) {
            document.querySelector('.sidebar').scrollLeft = parseInt(scrollPosition);
        }
    });

    const sectionsContent = ['calories', 'training-plan', 'total-trainings', 'weekly-body-form', 'body-results', 'weekly-strength-form', 'strength-results'];

    sectionsContent.forEach(item => {
        document.querySelector(`.${item}-section`).addEventListener('click', (e) => {
            window.location.href = `/fitness-tracker/${item}`;
        });
    });

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

            console.log(data);

            const response = await fetch('/login', {
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
});


