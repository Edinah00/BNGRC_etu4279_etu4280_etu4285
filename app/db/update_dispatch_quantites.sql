ALTER TABLE don
    ADD COLUMN IF NOT EXISTS quantite_utilisee DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER quantite;

ALTER TABLE besoin
    ADD COLUMN IF NOT EXISTS quantite_satisfaite DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER quantite;

UPDATE don d
LEFT JOIN (
    SELECT id_don, COALESCE(SUM(quantite_attribuee), 0) AS total_utilise
    FROM distribution
    GROUP BY id_don
) x ON x.id_don = d.id_don
SET d.quantite_utilisee = LEAST(d.quantite, COALESCE(x.total_utilise, 0));



