-- Vue: état des dons (quantités distribuées/restantes)
CREATE OR REPLACE VIEW etat_dons AS
SELECT
    d.id_don,
    d.id_type,
    tb.libelle AS type_besoin,
    d.quantite AS quantite_totale,
    COALESCE(SUM(dist.quantite_attribuee), 0) AS quantite_distribuee,
    d.quantite - COALESCE(SUM(dist.quantite_attribuee), 0) AS quantite_restante,
    CASE
        WHEN d.quantite - COALESCE(SUM(dist.quantite_attribuee), 0) = 0 THEN 'Épuisé'
        ELSE 'Disponible'
    END AS statut
FROM don d
JOIN type_besoin tb ON tb.id_type = d.id_type
LEFT JOIN distribution dist ON dist.id_don = d.id_don
GROUP BY d.id_don, d.id_type, tb.libelle, d.quantite;

-- Vue: état des besoins (quantités reçues/restantes)
-- Note: la table distribution étant liée à la ville (et non id_besoin),
-- la quantité reçue est calculée par (ville, type de besoin).
CREATE OR REPLACE VIEW etat_besoins AS
WITH dist_ville_type AS (
    SELECT
        dist.id_ville,
        d.id_type,
        SUM(dist.quantite_attribuee) AS quantite_recue
    FROM distribution dist
    JOIN don d ON d.id_don = dist.id_don
    GROUP BY dist.id_ville, d.id_type
)
SELECT
    b.id_besoin,
    b.id_ville,
    v.nom AS ville,
    b.id_type,
    tb.libelle AS type_besoin,
    b.quantite AS quantite_demandee,
    b.prix_unitaire,
    COALESCE(dvt.quantite_recue, 0) AS quantite_recue,
    b.quantite - COALESCE(dvt.quantite_recue, 0) AS quantite_restante,
    (b.quantite - COALESCE(dvt.quantite_recue, 0)) * b.prix_unitaire AS valeur_restante,
    CASE
        WHEN b.quantite - COALESCE(dvt.quantite_recue, 0) <= 0 THEN 'Satisfait'
        WHEN COALESCE(dvt.quantite_recue, 0) > 0 THEN 'Partiellement satisfait'
        ELSE 'Non satisfait'
    END AS statut
FROM besoin b
JOIN ville v ON v.id_ville = b.id_ville
JOIN type_besoin tb ON tb.id_type = b.id_type
LEFT JOIN dist_ville_type dvt
    ON dvt.id_ville = b.id_ville
    AND dvt.id_type = b.id_type;
