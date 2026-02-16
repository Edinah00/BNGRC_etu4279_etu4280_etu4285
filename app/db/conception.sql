-- ========================================
-- 1. NETTOYAGE COMPLET
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
-- 2. INSERTION DES RÉGIONS (obligatoire en premier)
-- ========================================
INSERT INTO region (nom) VALUES
('Analamanga'),
('Vakinankaratra'),
('Itasy'),
('Haute Matsiatra'),
('Atsinanana'),
('Boeny');

-- ========================================
-- 3. INSERTION DES VILLES (dépend de region)
-- ========================================
INSERT INTO ville (nom, id_region) VALUES
('Antananarivo', 1),
('Antsirabe', 2),
('Arivonimamo', 3),
('Fianarantsoa', 4),
('Toamasina', 5),
('Mahajanga', 6);

-- ========================================
-- 4. INSERTION DES TYPES DE BESOINS
-- ========================================
INSERT INTO type_besoin (libelle) VALUES
('Riz'),
('Eau potable'),
('Médicaments'),
('Couvertures'),
('Vêtements');

-- ========================================
-- 5. SCÉNARIO 1 : Riz - Don insuffisant
-- ========================================
INSERT INTO besoin (id_ville, id_type, nom_produit, quantite, prix_unitaire, date_saisie) VALUES
(1, 1, 'Riz (sac 50kg)', 500, 2000.00, '2026-02-10 08:00:00'),
(5, 1, 'Riz (sac 50kg)', 400, 2000.00, '2026-02-10 10:30:00'),
(6, 1, 'Riz (sac 50kg)', 300, 2000.00, '2026-02-10 14:00:00');

INSERT INTO don (id_type, quantite, date_don) VALUES
(1, 800, '2026-02-09 09:00:00');

-- ========================================
-- 6. SCÉNARIO 2 : Eau - Don excédentaire
-- ========================================
INSERT INTO besoin (id_ville, id_type, nom_produit, quantite, prix_unitaire, date_saisie) VALUES
(4, 2, 'Eau potable (bouteille 1.5L)', 1200, 1500.00, '2026-02-11 09:00:00'),
(3, 2, 'Eau potable (bouteille 1.5L)', 800, 1500.00, '2026-02-11 15:00:00');

INSERT INTO don (id_type, quantite, date_don) VALUES
(2, 3000, '2026-02-10 08:00:00');

-- ========================================
-- 7. SCÉNARIO 3 : Médicaments - Deux dons
-- ========================================
INSERT INTO besoin (id_ville, id_type, nom_produit, quantite, prix_unitaire, date_saisie) VALUES
(1, 3, 'Antibiotiques', 400, 25000.00, '2026-02-12 07:00:00'),
(5, 3, 'Antibiotiques', 350, 25000.00, '2026-02-12 11:00:00'),
(2, 3, 'Antibiotiques', 250, 25000.00, '2026-02-12 16:00:00');

INSERT INTO don (id_type, quantite, date_don) VALUES
(3, 500, '2026-02-11 10:00:00'),
(3, 300, '2026-02-11 14:00:00');

-- ========================================
-- 8. SCÉNARIO 4 : Couvertures - Équilibré
-- ========================================
INSERT INTO besoin (id_ville, id_type, nom_produit, quantite, prix_unitaire, date_saisie) VALUES
(6, 4, 'Couvertures en laine', 250, 18000.00, '2026-02-13 08:30:00'),
(4, 4, 'Couvertures en laine', 200, 18000.00, '2026-02-13 13:00:00'),
(3, 4, 'Couvertures en laine', 150, 18000.00, '2026-02-13 17:00:00');

INSERT INTO don (id_type, quantite, date_don) VALUES
(4, 600, '2026-02-12 09:00:00');

-- ========================================
-- 9. SCÉNARIO 5 : Vêtements - Partiel
-- ========================================
INSERT INTO besoin (id_ville, id_type, nom_produit, quantite, prix_unitaire, date_saisie) VALUES
(2, 5, 'Vêtements enfants', 500, 12000.00, '2026-02-14 10:00:00');

INSERT INTO don (id_type, quantite, date_don) VALUES
(5, 200, '2026-02-13 11:00:00');

-- ========================================
-- 10. VÉRIFICATION
-- ========================================
SELECT 'RÉGIONS' AS Table_Name, COUNT(*) AS Nb_Lignes FROM region
UNION ALL
SELECT 'VILLES', COUNT(*) FROM ville
UNION ALL
SELECT 'TYPES', COUNT(*) FROM type_besoin
UNION ALL
SELECT 'BESOINS', COUNT(*) FROM besoin
UNION ALL
SELECT 'DONS', COUNT(*) FROM don;
```
