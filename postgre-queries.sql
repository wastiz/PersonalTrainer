use fitness_tracker;
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    is_assigned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (password)
SELECT CONCAT(
    CHR(FLOOR(65 + (RANDOM() * 26))::int),  -- A-Z
    CHR(FLOOR(97 + (RANDOM() * 26))::int),  -- a-z
    CHR(FLOOR(48 + (RANDOM() * 10))::int),  -- 0-9
    CHR(FLOOR(65 + (RANDOM() * 26))::int),  -- A-Z
    CHR(FLOOR(97 + (RANDOM() * 26))::int),  -- a-z
    CHR(FLOOR(48 + (RANDOM() * 10))::int),  -- 0-9
    CHR(FLOOR(65 + (RANDOM() * 26))::int),  -- A-Z
    CHR(FLOOR(97 + (RANDOM() * 26))::int)   -- a-z
) AS password
FROM generate_series(1, 200);

UPDATE users SET email = 'valnos04@gmail.com' WHERE id = 1

CREATE TABLE body_data (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    waist DECIMAL(5,2),
    chest DECIMAL(5,2),
    shoulders DECIMAL(5,2),
    biceps DECIMAL(5,2),
    forearms DECIMAL(5,2),
    neck DECIMAL(5,2),
    hips DECIMAL(5,2),
    calves DECIMAL(5,2),
    measurement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

INSERT INTO body_data (email, height, weight, waist, chest, shoulders, biceps, forearms, neck, hips, calves)
VALUES ('valnos04@gmail.com', 175.00, 70.00, 85.00, 95.00, 45.00, 35.00, 30.00, 38.00, 90.00, 35.00);

CREATE TABLE strength_data (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    bench_press_wide DECIMAL(5,2),
    bench_press_narrow DECIMAL(5,2),
    bicep_curl DECIMAL(5,2),
    bent_over_one_arm_row DECIMAL(5,2),
    deadlift DECIMAL(5,2),
    squats DECIMAL(5,2),
    measurement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

INSERT INTO strength_data (
    email,
    bench_press_wide,
    bench_press_narrow,
    bicep_curl,
    bent_over_one_arm_row,
    deadlift,
    squats,
    measurement_date
) VALUES
('valnos04@gmail.com', 95.50, 90.00, 42.50, 70.00, 160.00, 120.00, '2024-10-18 14:30:00');


CREATE TABLE IF NOT EXISTS training_plans (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    weekly_sessions INT NOT NULL,                      -- Количество тренировок в неделю
    session_duration_hours DECIMAL(4, 2) NOT NULL,     -- Продолжительность каждой тренировки в часах
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE total_trainings (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
    sessions INT,
    hours INT
);

create table training_days_weekly (
    id SERIAL primary key,
    email varchar(255) references users(email) on delete cascade,
    week_day varchar(255),
    attended boolean,
    to_show boolean
);

create table users_streaks (
    id serial primary key,
    email varchar (255) references users(email) on delete cascade,
    streak INT
);

INSERT INTO training_plans (email, weekly_sessions, session_duration_hours)
VALUES ('valnos04@gmail.com', 3, 1.5);

INSERT INTO training_days (email, day_of_week)
VALUES
    ('valnos04@gmail.com', 'Monday'),
    ('valnos04@gmail.com', 'Wednesday'),
    ('valnos04@gmail.com', 'Friday');

INSERT INTO training_sessions (email, plan_id, session_date, attended)
VALUES
    ('valnos04@gmail.com', 1, '2023-10-01', TRUE),
    ('valnos04@gmail.com', 1, '2023-10-04', TRUE),
    ('valnos04@gmail.com', 1, '2023-10-06', FALSE),
    ('valnos04@gmail.com', 1, '2023-10-08', TRUE);


INSERT INTO attendance_streaks (email, start_date, end_date, streak_length)
VALUES
    ('valnos04@gmail.com', '2023-10-01', NULL, 3);


CREATE TABLE IF NOT EXISTS calorie_plans (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE REFERENCES users(email) ON DELETE CASCADE,
    daily_calorie_goal INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS calorie_entries (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    calories INT NOT NULL,  -- Количество потребленных калорий
    entry_date DATE DEFAULT CURRENT_DATE  -- Дата записи
);
