<?php

declare(strict_types=1);

class VillesModel
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function list(): array
    {
        $stmt = $this->db->query(
            "SELECT v.id_ville AS id, v.nom, v.id_region AS region_id, r.nom AS region
             FROM ville v
             LEFT JOIN region r ON r.id_region = v.id_region
             ORDER BY v.nom ASC"
        );

        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }

    public function regions(): array
    {
        $stmt = $this->db->query('SELECT id_region AS id, nom FROM region ORDER BY nom ASC');
        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }

    public function create(string $nom, int $regionId): int
    {
        $stmt = $this->db->prepare('INSERT INTO ville (nom, id_region) VALUES (:nom, :region_id)');
        $stmt->execute([':nom' => $nom, ':region_id' => $regionId]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, string $nom, int $regionId): bool
    {
        $stmt = $this->db->prepare('UPDATE ville SET nom = :nom, id_region = :region_id WHERE id_ville = :id');
        return $stmt->execute([':nom' => $nom, ':region_id' => $regionId, ':id' => $id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM ville WHERE id_ville = :id');
        return $stmt->execute([':id' => $id]);
    }
}
