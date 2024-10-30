document.addEventListener("DOMContentLoaded", function () {
    const bottomSections = `
    <div class="section-block calories-section flex flex-row flex-center gap-5">
        <div>
            <h5 class="no-underline">Calories</h5>
            <label for="">Consumed</label>
            <p>300cal</p>
            <label>Remaining</label>
            <p>170 cal</p>
        </div>
        <img width="30%" src="/img/icons/calories.png" alt="form">
    </div>
    <div class="section-block training-plan-section flex flex-row flex-center gap-5">
        <div>
            <h5>Current training plan</h5>
            <label>Type</label>
            <p>Muscle gaining</p>
        </div>
        <img src="/img/icons/project.png" alt="training plan" width="100" height="100">
    </div>
    <div class="section-block total-trainings-section flex flex-row flex-center gap-5">
        <div>
            <h5>Total trainings</h5>
            <label for="">This week</label>
            <p></p>
            <label>Previous</label>
            <p>2h</p>
        </div>
        <div class="outline-border">
            37 hours
        </div>
    </div>
`;

    const rightSections = `
        <div class="section-block weekly-body-form-section flex flex-row flex-center gap-5">
            <div>
                <h5>Weekly form</h5>
                <p>Weekly form to fill</p>
                <button class="btn btn-primary">Start</button>
            </div>
            <img width="30%" src="/img/icons/contact-form.png" alt="form">
        </div>
        <div class="section-block body-results-section flex flex-row flex-center gap-5">
            <div>
                <h5>Body results</h5>
                <p>Body results in graphs</p>
                <button class="btn btn-primary">Watch</button>
            </div>
            <img width="30%" src="/img/icons/growth.png" alt="formik">
        </div>
        <div class="section-block weekly-strength-form-section flex flex-row flex-center gap-5">
            <div class="width-50">
                <h5>Strength form</h5>
                <p>Weekly strength form</p>
                <button class="btn btn-primary">Start</button>
            </div>
            <img width="30%" src="/img/icons/contact-form.png" alt="form">
        </div>
        <div class="section-block strength-results-section flex flex-row flex-center gap-5">
            <div>
                <h5>Strength results</h5>
                <p>strength results in graphs</p>
                <button class="btn btn-primary">Watch</button>
            </div>
            <img width="30%" src="/img/icons/growth.png" alt="formik">
        </div>
    `;


    const bottomSection = document.querySelector('.bottom-block');
    const rightSection = document.querySelector('.right-block');


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
    }

    updateSections();

    window.addEventListener('resize', updateSections);

    const sectionsContent = ['calories', 'training-plan', 'total-trainings', 'weekly-body-form', 'body-results', 'weekly-strength-form', 'strength-results'];

    sectionsContent.forEach(item => {
        document.querySelector(`.${item}-section`).addEventListener('click', ()=>{
            window.location.href = `/fitness-tracker/${item}`;
        })
    })

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

});
