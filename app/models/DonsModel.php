<?php

declare(strict_types=1);

class DonsModel
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function list(): array
    {
        $stmt = $this->db->query(
            "SELECT d.id_don AS id, d.id_type AS type_id, t.libelle AS type, d.quantite, d.date_don,
                    (d.quantite * COALESCE(tp.prix_moyen, 0)) AS valeur_estimee
             FROM don d
             LEFT JOIN type_besoin t ON t.id_type = d.id_type
             LEFT JOIN (
                SELECT id_type, AVG(prix_unitaire) AS prix_moyen
                FROM besoin
                GROUP BY id_type
             ) tp ON tp.id_type = d.id_type
             ORDER BY d.date_don DESC, d.id_don DESC"
        );

        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }

    public function types(): array
    {
        $stmt = $this->db->query('SELECT id_type AS id, libelle, categorie FROM type_besoin ORDER BY libelle ASC');
        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }

    public function create(int $typeId, float $quantite, string $dateDon): int
    {
        $stmt = $this->db->prepare('INSERT INTO don (id_type, quantite, date_don) VALUES (:type_id, :quantite, :date_don)');
        $stmt->execute([
            ':type_id' => $typeId,
            ':quantite' => $quantite,
            ':date_don' => $dateDon,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, int $typeId, float $quantite, string $dateDon): bool
    {
        $stmt = $this->db->prepare('UPDATE don SET id_type = :type_id, quantite = :quantite, date_don = :date_don WHERE id_don = :id');
        return $stmt->execute([
            ':id' => $id,
            ':type_id' => $typeId,
            ':quantite' => $quantite,
            ':date_don' => $dateDon,
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM don WHERE id_don = :id');
        return $stmt->execute([':id' => $id]);
    }
}
