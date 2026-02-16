-- Ajouter le champ categorie
ALTER TABLE type_besoin 
ADD COLUMN categorie ENUM('nature', 'matériaux', 'argent') NOT NULL AFTER libelle;