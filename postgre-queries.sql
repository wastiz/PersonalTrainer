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

-- Таблица предпочтительных дней недели для тренировок
CREATE TABLE IF NOT EXISTS training_days (
    id SERIAL PRIMARY KEY,
    plan_id INT NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL,                  -- День недели (например, "Monday", "Tuesday")
    UNIQUE (plan_id, day_of_week)                      -- Уникальность пары "план - день недели"
);

-- Таблица сессий тренировок (фактические посещения)
CREATE TABLE IF NOT EXISTS training_sessions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    plan_id INT REFERENCES training_plans(id) ON DELETE SET NULL,
    session_date DATE NOT NULL,                        -- Дата фактической тренировки
    attended BOOLEAN DEFAULT FALSE,                    -- Флаг, была ли тренировка посещена
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для отслеживания полосы посещаемости (огонечка)
CREATE TABLE IF NOT EXISTS attendance_streaks (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    start_date DATE NOT NULL,                          -- Дата начала полосы подряд посещенных тренировок
    end_date DATE,                                     -- Дата окончания полосы (если не закончена, то NULL)
    streak_length INT DEFAULT 1,                       -- Длина текущей полосы подряд посещений
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
