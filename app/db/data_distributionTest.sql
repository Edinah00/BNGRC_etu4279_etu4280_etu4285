-- ========================================
-- NETTOYAGE (optionnel)
-- ========================================
DELETE FROM distribution;
DELETE FROM don;
DELETE FROM besoin;
DELETE FROM type_besoin;
DELETE FROM ville;
DELETE FROM region;

-- ========================================
-- DONNÉES DE TEST POUR SIMULATION DISPATCH
-- ========================================

-- Insertion des régions
INSERT INTO region (nom) VALUES
('Analamanga'),
('Vakinankaratra'),
('Itasy'),
('Haute Matsiatra'),
('Atsinanana'),
('Boeny');

-- Insertion des villes
INSERT INTO ville (nom, id_region) VALUES
('Antananarivo', 1),
('Antsirabe', 2),
('Arivonimamo', 3),
('Fianarantsoa', 4),
('Toamasina', 5),
('Mahajanga', 6);

-- Insertion des types de besoins
INSERT INTO type_besoin (libelle) VALUES
('Riz'),
('Eau potable'),
('Médicaments'),
('Couvertures'),
('Vêtements');

-- ========================================
-- SCÉNARIO 1 : Riz - Don insuffisant (FIFO sera visible)
-- Don total: 800 kg | Besoins totaux: 1200 kg
-- ========================================
INSERT INTO besoin (id_ville, id_type, quantite, prix_unitaire, date_saisie) VALUES
-- Antananarivo demande en premier (10 fév, 08h00)
(1, 1, 500, 2000.00, '2026-02-10 08:00:00'),
-- Toamasina demande en deuxième (10 fév, 10h30)
(5, 1, 400, 2000.00, '2026-02-10 10:30:00'),
-- Mahajanga demande en troisième (10 fév, 14h00)
(6, 1, 300, 2000.00, '2026-02-10 14:00:00');

-- Don de Riz : 800 kg
INSERT INTO don (id_type, quantite, date_don) VALUES
(1, 800, '2026-02-09 09:00:00');

-- ========================================
-- SCÉNARIO 2 : Eau - Don excédentaire (test de surplus)
-- Don total: 3000 L | Besoins totaux: 2000 L
-- ========================================
INSERT INTO besoin (id_ville, id_type, quantite, prix_unitaire, date_saisie) VALUES
-- Fianarantsoa demande en premier (11 fév, 09h00)
(4, 2, 1200, 1500.00, '2026-02-11 09:00:00'),
-- Arivonimamo demande en second (11 fév, 15h00)
(3, 2, 800, 1500.00, '2026-02-11 15:00:00');

-- Don d'Eau : 3000 L
INSERT INTO don (id_type, quantite, date_don) VALUES
(2, 3000, '2026-02-10 08:00:00');

-- ========================================
-- SCÉNARIO 3 : Médicaments - Deux dons pour plusieurs besoins
-- Don total: 500 + 300 = 800 | Besoins totaux: 1000
-- ========================================
INSERT INTO besoin (id_ville, id_type, quantite, prix_unitaire, date_saisie) VALUES
-- Antananarivo (12 fév, 07h00)
(1, 3, 400, 25000.00, '2026-02-12 07:00:00'),
-- Toamasina (12 fév, 11h00)
(5, 3, 350, 25000.00, '2026-02-12 11:00:00'),
-- Antsirabe (12 fév, 16h00)
(2, 3, 250, 25000.00, '2026-02-12 16:00:00');

-- Premier don : 500 unités
INSERT INTO don (id_type, quantite, date_don) VALUES
(3, 500, '2026-02-11 10:00:00');

-- Deuxième don : 300 unités
INSERT INTO don (id_type, quantite, date_don) VALUES
(3, 300, '2026-02-11 14:00:00');

-- ========================================
-- SCÉNARIO 4 : Couvertures - Distribution équilibrée
-- Don total: 600 | Besoins totaux: 600
-- ========================================
INSERT INTO besoin (id_ville, id_type, quantite, prix_unitaire, date_saisie) VALUES
-- Mahajanga (13 fév, 08h30)
(6, 4, 250, 18000.00, '2026-02-13 08:30:00'),
-- Fianarantsoa (13 fév, 13h00)
(4, 4, 200, 18000.00, '2026-02-13 13:00:00'),
-- Arivonimamo (13 fév, 17h00)
(3, 4, 150, 18000.00, '2026-02-13 17:00:00');

-- Don de Couvertures : exactement 600
INSERT INTO don (id_type, quantite, date_don) VALUES
(4, 600, '2026-02-12 09:00:00');

-- ========================================
-- SCÉNARIO 5 : Vêtements - Un seul besoin, petit don
-- Don total: 200 | Besoins totaux: 500
-- ========================================
INSERT INTO besoin (id_ville, id_type, quantite, prix_unitaire, date_saisie) VALUES
(2, 5, 500, 12000.00, '2026-02-14 10:00:00');

-- Don de Vêtements : seulement 200 sur 500 demandés
INSERT INTO don (id_type, quantite, date_don) VALUES
(5, 200, '2026-02-13 11:00:00');