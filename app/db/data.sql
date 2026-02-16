-- Insertion des régions (10)
INSERT INTO region (nom) VALUES
('Analamanga'),
('Vakinankaratra'),
('Itasy'),
('Haute Matsiatra'),
('Atsinanana'),
('Boeny'),
('Atsimo-Andrefana'),
('Diana'),
('Sava'),
('Menabe');

-- Insertion des villes (10)
INSERT INTO ville (nom, id_region) VALUES
('Antananarivo', 1),
('Antsirabe', 2),
('Arivonimamo', 3),
('Fianarantsoa', 4),
('Toamasina', 5),
('Mahajanga', 6),
('Toliara', 7),
('Antsiranana', 8),
('Sambava', 9),
('Morondava', 10);

-- Insertion des types de besoins (10)
INSERT INTO type_besoin (libelle) VALUES
('Nourriture'),
('Eau potable'),
('Médicaments'),
('Vêtements'),
('Couvertures'),
('Matériel scolaire'),
('Kits d\'hygiène'),
('Abris temporaires'),
('Outils agricoles'),
('Semences');

-- Insertion des besoins (10)
INSERT INTO besoin (id_ville, id_type, nom_produit, quantite, prix_unitaire, date_saisie) VALUES
(1, 1, 'Riz (sac 50kg)', 500, 15000.00, '2026-02-10 08:30:00'),
(2, 2, 'Eau minérale (bouteille 1.5L)', 1000, 2500.00, '2026-02-11 09:00:00'),
(3, 3, 'Antibiotiques', 200, 25000.00, '2026-02-12 10:15:00'),
(4, 4, 'Vêtements enfants', 400, 12000.00, '2026-02-13 11:30:00'),
(5, 5, 'Couvertures en laine', 250, 18000.00, '2026-02-14 15:00:00'),
(6, 6, 'Cahiers et stylos', 300, 8000.00, '2026-02-15 14:20:00'),
(7, 7, 'Savon et dentifrice', 150, 20000.00, '2026-02-10 13:15:00'),
(8, 8, 'Tentes familiales', 100, 150000.00, '2026-02-11 16:45:00'),
(9, 9, 'Houes et pelles', 80, 45000.00, '2026-02-12 10:00:00'),
(10, 10, 'Semences de maïs', 200, 8500.00, '2026-02-13 15:30:00');

-- Insertion des dons (10)
INSERT INTO don (id_type, quantite, date_don) VALUES
(1, 3000, '2026-02-05 09:00:00'),
(2, 5000, '2026-02-06 08:15:00'),
(3, 800, '2026-02-07 09:30:00'),
(4, 1500, '2026-02-08 10:00:00'),
(5, 900, '2026-02-09 12:00:00'),
(6, 1000, '2026-02-10 09:45:00'),
(7, 500, '2026-02-11 14:15:00'),
(8, 250, '2026-02-12 10:30:00'),
(9, 300, '2026-02-13 11:00:00'),
(10, 800, '2026-02-14 09:20:00');

-- Insertion des distributions (10)
INSERT INTO distribution (id_don, id_ville, quantite_attribuee, date_dispatch) VALUES
(1, 1, 500, '2026-02-05 14:00:00'),
(2, 2, 1000, '2026-02-06 10:00:00'),
(3, 3, 200, '2026-02-07 11:00:00'),
(4, 4, 400, '2026-02-08 12:00:00'),
(5, 5, 250, '2026-02-09 14:00:00'),
(6, 6, 300, '2026-02-10 11:00:00'),
(7, 7, 150, '2026-02-11 16:00:00'),
(8, 8, 100, '2026-02-12 12:00:00'),
(9, 9, 80, '2026-02-13 13:00:00'),
(10, 10, 200, '2026-02-14 11:00:00');