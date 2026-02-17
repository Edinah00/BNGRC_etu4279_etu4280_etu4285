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

