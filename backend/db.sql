-- CREATE TABLES

CREATE TABLE users (
    user_id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    user_role VARCHAR NOT NULL,
    created_at VARCHAR NOT NULL
);

CREATE TABLE designer_profiles (
    profile_id VARCHAR PRIMARY KEY,
    user_id VARCHAR UNIQUE NOT NULL,
    bio TEXT,
    resume_link TEXT,
    profile_picture TEXT,
    social_media_links JSON,
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE projects (
    project_id VARCHAR PRIMARY KEY,
    designer_id VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    category VARCHAR,
    created_at VARCHAR NOT NULL,
    updated_at VARCHAR NOT NULL,
    FOREIGN KEY (designer_id) REFERENCES designer_profiles (profile_id)
);

CREATE TABLE project_media (
    media_id VARCHAR PRIMARY KEY,
    project_id VARCHAR NOT NULL,
    media_type VARCHAR NOT NULL,
    media_url TEXT NOT NULL,
    display_order INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects (project_id)
);

CREATE TABLE customization_options (
    customization_id VARCHAR PRIMARY KEY,
    designer_id VARCHAR NOT NULL,
    theme_choice VARCHAR,
    color_palette JSON,
    logo_url TEXT,
    FOREIGN KEY (designer_id) REFERENCES designer_profiles (profile_id)
);

CREATE TABLE contact_messages (
    message_id VARCHAR PRIMARY KEY,
    designer_id VARCHAR NOT NULL,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    subject TEXT,
    message_body TEXT NOT NULL,
    sent_at VARCHAR NOT NULL,
    FOREIGN KEY (designer_id) REFERENCES designer_profiles (profile_id)
);

CREATE TABLE seo_and_analytics (
    seo_id VARCHAR PRIMARY KEY,
    project_id VARCHAR NOT NULL,
    page_title TEXT,
    meta_description TEXT,
    alt_texts JSON,
    FOREIGN KEY (project_id) REFERENCES projects (project_id)
);

-- SEED DATA

INSERT INTO users (user_id, email, password_hash, user_role, created_at) VALUES
    ('user123', 'designer1@example.com', 'hashedpassword123', 'designer', '2023-01-01'),
    ('user456', 'visitor1@example.com', 'hashedpassword456', 'visitor', '2023-02-01');

INSERT INTO designer_profiles (profile_id, user_id, bio, resume_link, profile_picture, social_media_links) VALUES
    ('profile123', 'user123', 'Experienced designer with a focus on UX/UI.', 'https://example.com/resume.pdf', 'https://picsum.photos/seed/profile123/200', '{"linkedin": "https://linkedin.com/in/designer123"}');

INSERT INTO projects (project_id, designer_id, title, description, category, created_at, updated_at) VALUES
    ('project123', 'profile123', 'Modern Website Design', 'A modern and responsive website design.', 'web', '2023-03-01', '2023-03-05');

INSERT INTO project_media (media_id, project_id, media_type, media_url, display_order) VALUES
    ('media123', 'project123', 'image', 'https://picsum.photos/seed/media123/400', 1),
    ('media124', 'project123', 'image', 'https://picsum.photos/seed/media124/400', 2);

INSERT INTO customization_options (customization_id, designer_id, theme_choice, color_palette, logo_url) VALUES
    ('custom123', 'profile123', 'dark', '{"background_color": "#000000", "text_color": "#FFFFFF"}', 'https://picsum.photos/seed/logo123/100');

INSERT INTO contact_messages (message_id, designer_id, sender_name, sender_email, subject, message_body, sent_at) VALUES
    ('message123', 'profile123', 'John Doe', 'john.doe@example.com', 'Inquiry', 'I am interested in your services.', '2023-04-01');

INSERT INTO seo_and_analytics (seo_id, project_id, page_title, meta_description, alt_texts) VALUES
    ('seo123', 'project123', 'Modern Website Design by Designer123', 'A brief meta description about the modern website design project.', '{"header_image": "modern website design image"}');