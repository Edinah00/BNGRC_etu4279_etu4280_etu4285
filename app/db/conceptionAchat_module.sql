-- ========================================
-- MODULE ACHATS VIA DONS EN ARGENT
-- ========================================

ALTER TABLE type_besoin
ADD COLUMN IF NOT EXISTS categorie ENUM('nature', 'matériaux', 'argent') NOT NULL DEFAULT 'nature' AFTER libelle;

UPDATE type_besoin
SET categorie = 'argent'
WHERE LOWER(libelle) = 'argent';

UPDATE type_besoin
SET categorie = 'matériaux'
WHERE libelle IN ('Tôle', 'Clou', 'Ciment', 'Tole');

CREATE TABLE IF NOT EXISTS configuration (
    id_config INT AUTO_INCREMENT PRIMARY KEY,
    cle VARCHAR(50) UNIQUE NOT NULL,
    valeur VARCHAR(100) NOT NULL,
    description TEXT,
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS achat (
    id_achat INT AUTO_INCREMENT PRIMARY KEY,
    id_besoin INT NOT NULL,
    id_ville INT NOT NULL,
    id_type INT NOT NULL,
    nom_produit VARCHAR(100) NOT NULL,
    quantite DECIMAL(12,2) NOT NULL,
    prix_unitaire DECIMAL(12,2) NOT NULL,
    montant_ht DECIMAL(12,2) NOT NULL,
    taux_frais DECIMAL(5,2) NOT NULL,
    montant_frais DECIMAL(12,2) NOT NULL,
    montant_ttc DECIMAL(12,2) NOT NULL,
    date_achat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_achat_besoin FOREIGN KEY (id_besoin) REFERENCES besoin(id_besoin),
    CONSTRAINT fk_achat_ville FOREIGN KEY (id_ville) REFERENCES ville(id_ville),
    CONSTRAINT fk_achat_type FOREIGN KEY (id_type) REFERENCES type_besoin(id_type)
);

CREATE INDEX idx_achat_besoin ON achat(id_besoin);
CREATE INDEX idx_achat_ville ON achat(id_ville);
CREATE INDEX idx_achat_type ON achat(id_type);
CREATE INDEX idx_achat_date ON achat(date_achat);

INSERT INTO configuration (cle, valeur, description)
VALUES ('taux_frais_achat', '10.00', 'Taux de frais d achat en pourcentage (ex: 10 pour 10%)')
ON DUPLICATE KEY UPDATE
    valeur = VALUES(valeur),
    description = VALUES(description);

DROP VIEW IF EXISTS besoins_achetables;
CREATE VIEW besoins_achetables AS
SELECT
    b.id_besoin,
    v.nom AS ville,
    b.id_ville,
    tb.libelle AS type_besoin,
    b.id_type,
    b.nom_produit,
    b.quantite AS quantite_demandee,
    b.prix_unitaire,
    COALESCE(SUM(dist.quantite_attribuee), 0) AS quantite_recue_distribution,
    COALESCE(SUM(a.quantite), 0) AS quantite_recue_achat,
    b.quantite - COALESCE(SUM(dist.quantite_attribuee), 0) - COALESCE(SUM(a.quantite), 0) AS quantite_restante,
    (b.quantite - COALESCE(SUM(dist.quantite_attribuee), 0) - COALESCE(SUM(a.quantite), 0)) * b.prix_unitaire AS valeur_restante,
    b.date_saisie
FROM besoin b
JOIN ville v ON b.id_ville = v.id_ville
JOIN type_besoin tb ON b.id_type = tb.id_type
LEFT JOIN distribution dist ON b.id_ville = dist.id_ville
    AND b.id_type = (SELECT d.id_type FROM don d WHERE d.id_don = dist.id_don)
LEFT JOIN achat a ON b.id_besoin = a.id_besoin
WHERE tb.categorie IN ('nature', 'matériaux')
GROUP BY b.id_besoin
HAVING quantite_restante > 0;

DROP FUNCTION IF EXISTS don_existe_pour_type;
DELIMITER $$
CREATE FUNCTION don_existe_pour_type(p_id_type INT)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_quantite_restante DECIMAL(12,2) DEFAULT 0;

    SELECT COALESCE(SUM(x.qte_restante), 0)
    INTO v_quantite_restante
    FROM (
        SELECT GREATEST(d.quantite - COALESCE(SUM(dist.quantite_attribuee), 0), 0) AS qte_restante
        FROM don d
        LEFT JOIN distribution dist ON dist.id_don = d.id_don
        WHERE d.id_type = p_id_type
        GROUP BY d.id_don, d.quantite
    ) x;

    RETURN v_quantite_restante > 0;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS before_achat_insert;
DELIMITER $$
CREATE TRIGGER before_achat_insert
BEFORE INSERT ON achat
FOR EACH ROW
BEGIN
    DECLARE v_don_restant DECIMAL(12,2) DEFAULT 0;
    DECLARE v_argent_disponible DECIMAL(12,2) DEFAULT 0;
    DECLARE v_categorie_type VARCHAR(20) DEFAULT '';

    SELECT categorie INTO v_categorie_type
    FROM type_besoin
    WHERE id_type = NEW.id_type
    LIMIT 1;

    IF v_categorie_type = 'argent' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Achat refusé: impossible d acheter de l argent avec de l argent';
    END IF;

    SELECT COALESCE(SUM(x.qte_restante), 0)
    INTO v_don_restant
    FROM (
        SELECT GREATEST(d.quantite - COALESCE(SUM(dist.quantite_attribuee), 0), 0) AS qte_restante
        FROM don d
        LEFT JOIN distribution dist ON dist.id_don = d.id_don
        WHERE d.id_type = NEW.id_type
        GROUP BY d.id_don, d.quantite
    ) x;

    IF v_don_restant > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Achat refusé: des dons existent encore pour ce type de besoin';
    END IF;

    SELECT
        COALESCE((
            SELECT SUM(d.quantite)
            FROM don d
            JOIN type_besoin tb ON tb.id_type = d.id_type
            WHERE tb.categorie = 'argent'
        ), 0)
        - COALESCE((SELECT SUM(a.montant_ttc) FROM achat a), 0)
    INTO v_argent_disponible;

    IF NEW.montant_ttc > v_argent_disponible THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Achat refusé: argent insuffisant';
    END IF;
END$$
DELIMITER ;
