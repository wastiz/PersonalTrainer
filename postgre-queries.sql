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

UPDATE users SET email = 'valnos04@gmail.com' WHERE id = 1;

CREATE TABLE IF NOT EXISTS body_data (
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

CREATE TABLE IF NOT EXISTS strength_data (
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
    weekly_sessions INT NOT NULL,                      -- Number of training sessions per week
    session_duration_hours DECIMAL(4, 2) NOT NULL,     -- Duration of each session in hours
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for preferred training days
CREATE TABLE IF NOT EXISTS training_days (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL,                  -- Day of the week (e.g., "Monday", "Tuesday")
    UNIQUE (email, day_of_week)                      -- Uniqueness of the pair "plan - day of week"
);

INSERT INTO training_days (email, day_of_week)
VALUES
('valnos04@gmail.com', 'Monday'),
('valnos04@gmail.com', 'Wednesday'),
('valnos04@gmail.com', 'Friday');

-- Table for training sessions (actual attendance)
CREATE TABLE IF NOT EXISTS training_sessions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    plan_id INT REFERENCES training_plans(id) ON DELETE SET NULL,
    session_date DATE NOT NULL,                        -- Date of the actual training
    attended BOOLEAN DEFAULT FALSE,                    -- Flag indicating whether the session was attended
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for tracking attendance streaks
CREATE TABLE IF NOT EXISTS attendance_streaks (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    start_date DATE NOT NULL,                          -- Start date of the streak of consecutive attended sessions
    end_date DATE,                                     -- End date of the streak (if not ended, then NULL)
    streak_length INT DEFAULT 1,                       -- Length of the current attendance streak
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO training_plans (email, weekly_sessions, session_duration_hours, created_at, updated_at)
VALUES
('valnos04@gmail.com', 3, 1.5, DEFAULT, DEFAULT); -- 3 sessions a week, each lasting 1.5 hours


-- Inserting sample data into the training_sessions table
INSERT INTO training_sessions (email, plan_id, session_date, attended, created_at)
VALUES
('valnos04@gmail.com', 1, '2024-10-20', TRUE, DEFAULT),  -- Attended session
('valnos04@gmail.com', 1, '2024-10-22', FALSE, DEFAULT), -- Did not attend session
('valnos04@gmail.com', 1, '2024-10-24', TRUE, DEFAULT);  -- Attended session

-- Inserting sample data into the attendance_streaks table
INSERT INTO attendance_streaks (email, start_date, end_date, streak_length, created_at, updated_at)
VALUES
('valnos04@gmail.com', '2024-10-20', NULL, 2, DEFAULT, DEFAULT); -- 2-day attendance streak starting from 20th Oct