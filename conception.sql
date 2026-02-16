CREATE TABLE region (
    id_region SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
);
CREATE TABLE ville (
    id_ville SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    id_region INT REFERENCES region(id_region)
);
CREATE TABLE type_besoin (
    id_type SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL
);
CREATE TABLE besoin (
    id_besoin SERIAL PRIMARY KEY,
    id_ville INT REFERENCES ville(id_ville),
    id_type INT REFERENCES type_besoin(id_type),
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(12,2) NOT NULL CHECK (prix_unitaire >= 0),
    date_saisie TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE don (
    id_don SERIAL PRIMARY KEY,
    id_type INT REFERENCES type_besoin(id_type),
    quantite NUMERIC(12,2) NOT NULL CHECK (quantite > 0),
    date_don TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE distribution (
    id_dispatch SERIAL PRIMARY KEY,
    id_don INT REFERENCES don(id_don),
    id_ville INT REFERENCES ville(id_ville),
    quantite_attribuee NUMERIC(12,2) NOT NULL CHECK (quantite_attribuee > 0),
    date_dispatch TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
