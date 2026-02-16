-- ========================================
-- BNGRC - DONNÉES PRÊTES À L'EMPLOI
-- Cyclone "BATSIRAI 2" - Février 2026
-- ========================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE distribution;
TRUNCATE TABLE don;
TRUNCATE TABLE besoin;
TRUNCATE TABLE type_besoin;
TRUNCATE TABLE ville;
TRUNCATE TABLE region;
SET FOREIGN_KEY_CHECKS = 1;


-- ========================================
-- 2. RÉGIONS (10 régions)
-- ========================================
INSERT INTO region (nom) VALUES
('Analamanga'),
('Vakinankaratra'),
('Atsinanana'),
('Analanjirofo'),
('Vatovavy Fitovinany'),
('Atsimo Atsinanana'),
('Haute Matsiatra'),
('Boeny'),
('Diana'),
('Sava');

-- ========================================
-- 3. VILLES TOUCHÉES (18 villes)
-- ========================================
INSERT INTO ville (nom, id_region) VALUES
-- Atsinanana (zone critique)
('Toamasina', 3),
('Brickaville', 3),
('Vatomandry', 3),

-- Analanjirofo
('Fenerive-Est', 4),
('Soanierana Ivongo', 4),

-- Vatovavy Fitovinany
('Manakara', 6),
('Mananjary', 6),

-- Atsimo Atsinanana
('Farafangana', 6),
('Vangaindrano', 6),

-- Haute Matsiatra
('Fianarantsoa', 7),
('Ambositra', 7),

-- Analamanga (coordination)
('Antananarivo', 1),

-- Vakinankaratra
('Antsirabe', 2),

-- Boeny
('Mahajanga', 8),

-- Diana
('Antsiranana', 9),

-- Sava
('Sambava', 10),
('Antalaha', 10),
('Vohemar', 10);

-- ========================================
-- 4. TYPES DE BESOINS (11 types avec catégories)
-- ========================================
INSERT INTO type_besoin (libelle, categorie) VALUES
-- EN NATURE (5 types)
('Riz', 'nature'),
('Huile', 'nature'),
('Sucre', 'nature'),
('Eau potable', 'nature'),
('Conserves', 'nature'),

-- EN MATÉRIAUX (5 types)
('Tôle', 'matériaux'),
('Clou', 'matériaux'),
('Bois', 'matériaux'),
('Ciment', 'matériaux'),
('Bâche', 'matériaux'),

-- EN ARGENT (1 type)
('Aide financière', 'argent');

-- ========================================
-- 5. BESOINS PAR ORDRE CHRONOLOGIQUE (FIFO)
-- Du 10 au 14 février 2026 - 35 besoins
-- ========================================

-- 10 FÉVRIER 2026 - ZONE CRITIQUE (Côte Est)
-- Toamasina - 07h00 (épicentre du cyclone)
INSERT INTO besoin (id_ville, id_type, nom_produit, quantite, prix_unitaire, date_saisie) VALUES
(1, 1, 'Riz (sac 50kg)', 2000, 120000.00, '2026-02-10 07:00:00'),
(1, 2, 'Huile (bidon 5L)', 600, 25000.00, '2026-02-10 07:30:00'),
(1, 4, 'Eau potable (carton 12x1.5L)', 1200, 18000.00, '2026-02-10 08:00:00'),
(1, 6, 'Tôle (3m)', 4000, 35000.00, '2026-02-10 08:30:00'),
(1, 7, 'Clou (kg)', 600, 8000.00, '2026-02-10 09:00:00'),

-- Brickaville - 09h30
(2, 1, 'Riz (sac 50kg)', 1000, 120000.00, '2026-02-10 09:30:00'),
(2, 4, 'Eau potable (carton 12x1.5L)', 600, 18000.00, '2026-02-10 10:00:00'),
(2, 6, 'Tôle (3m)', 1500, 35000.00, '2026-02-10 10:30:00'),

-- Fenerive-Est - 11h00
(4, 1, 'Riz (sac 50kg)', 1200, 120000.00, '2026-02-10 11:00:00'),
(4, 2, 'Huile (bidon 5L)', 400, 25000.00, '2026-02-10 11:30:00'),
(4, 6, 'Tôle (3m)', 2000, 35000.00, '2026-02-10 12:00:00'),

-- Vatomandry - 14h00
(3, 1, 'Riz (sac 50kg)', 800, 120000.00, '2026-02-10 14:00:00'),
(3, 10, 'Bâche (rouleau 100m²)', 200, 150000.00, '2026-02-10 14:30:00'),

-- 11 FÉVRIER 2026
-- Manakara - 08h00
(6, 1, 'Riz (sac 50kg)', 1500, 120000.00, '2026-02-11 08:00:00'),
(6, 3, 'Sucre (kg)', 500, 4500.00, '2026-02-11 08:30:00'),
(6, 6, 'Tôle (3m)', 2000, 35000.00, '2026-02-11 09:00:00'),

-- Farafangana - 10h00
(8, 1, 'Riz (sac 50kg)', 1600, 120000.00, '2026-02-11 10:00:00'),
(8, 4, 'Eau potable (carton 12x1.5L)', 800, 18000.00, '2026-02-11 10:30:00'),

-- Mananjary - 13h00
(7, 1, 'Riz (sac 50kg)', 900, 120000.00, '2026-02-11 13:00:00'),
(7, 2, 'Huile (bidon 5L)', 300, 25000.00, '2026-02-11 13:30:00'),

-- Soanierana Ivongo - 15h00
(5, 1, 'Riz (sac 50kg)', 700, 120000.00, '2026-02-11 15:00:00'),
(5, 6, 'Tôle (3m)', 1200, 35000.00, '2026-02-11 15:30:00'),

-- 12 FÉVRIER 2026 - ZONE MODÉRÉE
-- Fianarantsoa - 09h00
(10, 1, 'Riz (sac 50kg)', 500, 120000.00, '2026-02-12 09:00:00'),
(10, 10, 'Bâche (rouleau 100m²)', 100, 150000.00, '2026-02-12 09:30:00'),

-- Ambositra - 11h00
(11, 1, 'Riz (sac 50kg)', 400, 120000.00, '2026-02-12 11:00:00'),
(11, 9, 'Ciment (sac 50kg)', 300, 42000.00, '2026-02-12 11:30:00'),

-- Antsirabe - 13h00
(13, 1, 'Riz (sac 50kg)', 600, 120000.00, '2026-02-12 13:00:00'),
(13, 2, 'Huile (bidon 5L)', 250, 25000.00, '2026-02-12 13:30:00'),

-- 13 FÉVRIER 2026
-- Antananarivo (centre de coordination) - Besoin en argent
(12, 11, 'Aide financière (Ar)', 50000000, 1.00, '2026-02-13 09:00:00'),

-- Mahajanga - 11h00
(14, 1, 'Riz (sac 50kg)', 450, 120000.00, '2026-02-13 11:00:00'),
(14, 4, 'Eau potable (carton 12x1.5L)', 500, 18000.00, '2026-02-13 11:30:00'),

-- Vangaindrano - 14h00
(9, 1, 'Riz (sac 50kg)', 550, 120000.00, '2026-02-13 14:00:00'),
(9, 6, 'Tôle (3m)', 1000, 35000.00, '2026-02-13 14:30:00'),

-- 14 FÉVRIER 2026
-- Sambava - 10h00
(16, 1, 'Riz (sac 50kg)', 500, 120000.00, '2026-02-14 10:00:00'),
(16, 6, 'Tôle (3m)', 800, 35000.00, '2026-02-14 10:30:00');

-- ========================================
-- 6. DONS PAR ORDRE CHRONOLOGIQUE
-- Du 9 au 15 février 2026 - 18 dons
-- ========================================

-- 9 FÉVRIER (avant évaluation complète)
INSERT INTO don (id_type, quantite, date_don) VALUES
(1, 4000, '2026-02-09 10:00:00'),   -- Riz: 4000 sacs (Croix-Rouge)
(4, 2500, '2026-02-09 14:00:00');   -- Eau: 2500 cartons (UNICEF)

-- 10 FÉVRIER (premiers secours)
INSERT INTO don (id_type, quantite, date_don) VALUES
(1, 7000, '2026-02-10 08:00:00'),   -- Riz: 7000 sacs (Gouvernement)
(2, 1800, '2026-02-10 10:00:00'),   -- Huile: 1800 bidons (PAM)
(4, 4000, '2026-02-10 12:00:00'),   -- Eau: 4000 cartons (ONU)
(6, 12000, '2026-02-10 14:00:00'),  -- Tôle: 12000 unités (BTP Madagascar)
(10, 600, '2026-02-10 16:00:00');   -- Bâche: 600 rouleaux (Croix-Rouge)

-- 11 FÉVRIER
INSERT INTO don (id_type, quantite, date_don) VALUES
(1, 5000, '2026-02-11 09:00:00'),   -- Riz: 5000 sacs (Fondation)
(7, 2000, '2026-02-11 11:00:00'),   -- Clou: 2000 kg (Quincaillerie)
(3, 1200, '2026-02-11 13:00:00');   -- Sucre: 1200 kg (Sucoma)

-- 12 FÉVRIER (dons en argent)
INSERT INTO don (id_type, quantite, date_don) VALUES
(11, 200000000, '2026-02-12 09:00:00'),  -- 200M Ar (Gouvernement)
(11, 120000000, '2026-02-12 14:00:00'),  -- 120M Ar (Entreprises)
(9, 600, '2026-02-12 16:00:00');         -- Ciment: 600 sacs

-- 13 FÉVRIER
INSERT INTO don (id_type, quantite, date_don) VALUES
(11, 80000000, '2026-02-13 10:00:00'),   -- 80M Ar (ONG internationales)
(6, 6000, '2026-02-13 14:00:00'),        -- Tôle: 6000 unités
(5, 400, '2026-02-13 16:00:00');         -- Conserves: 400 cartons

-- 14 FÉVRIER
INSERT INTO don (id_type, quantite, date_don) VALUES
(8, 100, '2026-02-14 10:00:00');         -- Bois: 100 m³
