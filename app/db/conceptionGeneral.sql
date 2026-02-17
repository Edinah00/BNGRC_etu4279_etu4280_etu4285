CREATE database IF NOT EXISTS bngrc;
use bngrc;
CREATE TABLE region (
    id_region INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
);

CREATE TABLE ville (
    id_ville INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    id_region INT,
    FOREIGN KEY (id_region) REFERENCES region(id_region)
);

CREATE TABLE type_besoin (
    id_type INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL,
    categorie ENUM('nature', 'matériaux', 'argent') NOT NULL
);

CREATE TABLE besoin (
    id_besoin INT AUTO_INCREMENT PRIMARY KEY,
    id_ville INT,
    id_type INT,
    nom_produit VARCHAR(100) NOT NULL,
    quantite INT NOT NULL,
    quantite_satisfaite DECIMAL(12,2) NOT NULL DEFAULT 0,
    prix_unitaire DECIMAL(12,2) NOT NULL,
    date_saisie TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ville) REFERENCES ville(id_ville),
    FOREIGN KEY (id_type) REFERENCES type_besoin(id_type)
);

CREATE TABLE don (
    id_don INT AUTO_INCREMENT PRIMARY KEY,
    id_type INT,
    quantite DECIMAL(12,2) NOT NULL,
    quantite_utilisee DECIMAL(12,2) NOT NULL DEFAULT 0,
    date_don TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_type) REFERENCES type_besoin(id_type)
);

CREATE TABLE distribution (
    id_dispatch INT AUTO_INCREMENT PRIMARY KEY,
    id_don INT,
    id_ville INT,
    quantite_attribuee DECIMAL(12,2) NOT NULL,
    date_dispatch TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_don) REFERENCES don(id_don),
    FOREIGN KEY (id_ville) REFERENCES ville(id_ville)
);


-- CREATE TABLE besoin (

--     id_besoin INT AUTO_INCREMENT PRIMARY KEY,

--     id_ville INT,

--     id_type INT,

--     nom_produit VARCHAR(100) NOT NULL,

--     quantite INT NOT NULL,

--     quantite_satisfaite DECIMAL(12,2) NOT NULL DEFAULT 0,

--     prix_unitaire DECIMAL(12,2) NOT NULL,

--     date_saisie TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

--     FOREIGN KEY (id_ville) REFERENCES ville(id_ville),

--     FOREIGN KEY (id_type) REFERENCES type_besoin(id_type)

-- );

-- CREATE TABLE don (

--     id_don INT AUTO_INCREMENT PRIMARY KEY,

--     id_type INT,

--     quantite DECIMAL(12,2) NOT NULL,

--     quantite_utilisee DECIMAL(12,2) NOT NULL DEFAULT 0,

--     date_don TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

--     FOREIGN KEY (id_type) REFERENCES type_besoin(id_type)

-- );, On a adopté ce nouveau conception, il faut que dans 
