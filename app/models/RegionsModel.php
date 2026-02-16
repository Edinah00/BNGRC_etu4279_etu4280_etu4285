<?php

declare(strict_types=1);

class RegionsModel
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function list(): array
    {
        $stmt = $this->db->query(
            "SELECT r.id_region AS id, r.nom, COUNT(v.id_ville) AS nb_villes
             FROM region r
             LEFT JOIN ville v ON v.id_region = r.id_region
             GROUP BY r.id_region, r.nom
             ORDER BY r.nom ASC"
        );

        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }

    public function create(string $nom): int
    {
        $stmt = $this->db->prepare('INSERT INTO region (nom) VALUES (:nom)');
        $stmt->execute([':nom' => $nom]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, string $nom): bool
    {
        $stmt = $this->db->prepare('UPDATE region SET nom = :nom WHERE id_region = :id');
        return $stmt->execute([':nom' => $nom, ':id' => $id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM region WHERE id_region = :id');
        return $stmt->execute([':id' => $id]);
    }
}
