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

