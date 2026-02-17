SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE distribution;
TRUNCATE TABLE don;
TRUNCATE TABLE besoin;
TRUNCATE TABLE type_besoin;
TRUNCATE TABLE ville;
TRUNCATE TABLE region;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO region (nom) VALUES
('Atsinanana'),
('Vatovavy Fitovinany'),
('Atsimo Atsinanana'),
('Diana'),
('Menabe');

INSERT INTO ville (nom, id_region) VALUES
('Toamasina',  1),
('Mananjary',  2),
('Farafangana',3),
('Nosy Be',    4),
('Morondava',  5);

INSERT INTO type_besoin (libelle, categorie) VALUES
('Riz (kg)',    'nature'),
('Eau (L)',     'nature'),
('Huile (L)',   'nature'),
('Haricots',    'nature'),
('Tôle',        'matériaux'),
('Bâche',       'matériaux'),
('Clous (kg)',  'matériaux'),
('Bois',        'matériaux'),
('groupe',      'matériaux'),
('Argent',      'argent');

INSERT INTO besoin (id_ville, id_type, nom_produit, quantite, prix_unitaire, date_saisie) VALUES
(1, 6,  'Bâche',      200,      15000.00, '2026-02-15 08:00:00'),
(4, 5,  'Tôle',        40,      25000.00, '2026-02-15 08:15:00'),
(2, 10, 'Argent',  6000000,         1.00, '2026-02-15 08:30:00'),
(1, 2,  'Eau (L)',    1500,      1000.00, '2026-02-15 08:45:00'),
(4, 1,  'Riz (kg)',    300,      3000.00, '2026-02-15 09:00:00'),
(2, 5,  'Tôle',        80,      25000.00, '2026-02-15 09:15:00'),
(4, 10, 'Argent',  4000000,         1.00, '2026-02-15 09:30:00'),
(3, 6,  'Bâche',      150,      15000.00, '2026-02-15 09:45:00'),
(2, 1,  'Riz (kg)',    500,      3000.00, '2026-02-15 10:00:00'),
(3, 10, 'Argent',  8000000,         1.00, '2026-02-15 10:15:00'),
(5, 1,  'Riz (kg)',    700,      3000.00, '2026-02-15 10:30:00'),
(1, 10, 'Argent', 12000000,         1.00, '2026-02-15 10:45:00'),
(5, 10, 'Argent', 10000000,         1.00, '2026-02-15 11:00:00'),
(3, 2,  'Eau (L)',    1000,      1000.00, '2026-02-15 11:15:00'),
(5, 6,  'Bâche',      180,      15000.00, '2026-02-15 11:30:00'),
(1, 9,  'groupe',       3,   6750000.00, '2026-02-15 11:45:00'),
(1, 1,  'Riz (kg)',    800,      3000.00, '2026-02-15 12:00:00'),
(4, 4,  'Haricots',    200,      4000.00, '2026-02-15 12:15:00'),
(2, 7,  'Clous (kg)',   60,      8000.00, '2026-02-15 12:30:00'),
(5, 2,  'Eau (L)',    1200,      1000.00, '2026-02-15 12:45:00'),
(3, 1,  'Riz (kg)',    600,      3000.00, '2026-02-15 13:00:00'),
(5, 8,  'Bois',        150,     10000.00, '2026-02-15 13:15:00'),
(1, 5,  'Tôle',        120,     25000.00, '2026-02-15 13:30:00'),
(4, 7,  'Clous (kg)',   30,      8000.00, '2026-02-15 13:45:00'),
(2, 3,  'Huile (L)',   120,      6000.00, '2026-02-15 14:00:00'),
(3, 8,  'Bois',        100,     10000.00, '2026-02-15 14:15:00');