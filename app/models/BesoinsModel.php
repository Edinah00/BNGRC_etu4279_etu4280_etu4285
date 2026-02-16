<?php

declare(strict_types=1);

class BesoinsModel
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function list(?int $villeId = null, ?int $typeId = null): array
    {
        $sql = "SELECT b.id_besoin AS id, b.id_ville AS ville_id, v.nom AS ville, b.id_type AS type_id,
                       t.libelle AS type, b.nom_produit AS description, b.quantite, b.prix_unitaire
                FROM besoin b
                LEFT JOIN ville v ON v.id_ville = b.id_ville
                LEFT JOIN type_besoin t ON t.id_type = b.id_type
                WHERE 1=1";
        $params = [];

        if ($villeId !== null) {
            $sql .= ' AND b.id_ville = :ville_id';
            $params[':ville_id'] = $villeId;
        }

        if ($typeId !== null) {
            $sql .= ' AND b.id_type = :type_id';
            $params[':type_id'] = $typeId;
        }

        $sql .= ' ORDER BY b.date_saisie DESC, b.id_besoin DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }

    public function villes(): array
    {
        $stmt = $this->db->query('SELECT id_ville AS id, nom FROM ville ORDER BY nom ASC');
        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }

    public function types(): array
    {
        $stmt = $this->db->query('SELECT id_type AS id, libelle FROM type_besoin ORDER BY libelle ASC');
        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }

    public function create(int $villeId, int $typeId, string $description, float $quantite, float $prixUnitaire): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO besoin (id_ville, id_type, nom_produit, quantite, prix_unitaire) VALUES (:ville_id, :type_id, :description, :quantite, :prix_unitaire)'
        );
        $stmt->execute([
            ':ville_id' => $villeId,
            ':type_id' => $typeId,
            ':description' => $description,
            ':quantite' => $quantite,
            ':prix_unitaire' => $prixUnitaire,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, int $villeId, int $typeId, string $description, float $quantite, float $prixUnitaire): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE besoin SET id_ville = :ville_id, id_type = :type_id, nom_produit = :description, quantite = :quantite, prix_unitaire = :prix_unitaire WHERE id_besoin = :id'
        );
        return $stmt->execute([
            ':id' => $id,
            ':ville_id' => $villeId,
            ':type_id' => $typeId,
            ':description' => $description,
            ':quantite' => $quantite,
            ':prix_unitaire' => $prixUnitaire,
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM besoin WHERE id_besoin = :id');
        return $stmt->execute([':id' => $id]);
    }
}
