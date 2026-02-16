<?php
// Fichier de diagnostic : test-debug.php
// Placez ce fichier à la racine de votre projet et accédez-y via http://localhost:8000/test-debug.php

session_start();

echo "<h1>Diagnostic Takalo-takalo</h1>";

// 1. Vérifier la session
echo "<h2>1. Session utilisateur</h2>";
echo "<pre>";
print_r($_SESSION);
echo "</pre>";

// 2. Vérifier la connexion à la base de données
echo "<h2>2. Connexion PostgreSQL</h2>";
try {
    $dsn = "pgsql:host=127.0.0.1;port=5433;dbname=takalo";
    $pdo = new PDO($dsn, 'postgres', 'postgres');
    echo "✅ Connexion réussie !<br>";
    
    // 3. Vérifier les catégories
    echo "<h2>3. Catégories disponibles</h2>";
    $stmt = $pdo->query("SELECT id, nom FROM categorie ORDER BY id");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($categories);
    echo "</pre>";
    
    // 4. Vérifier les objets
    echo "<h2>4. Objets dans la base</h2>";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM objet");
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total objets : " . $count['total'] . "<br>";
    
    // 5. Derniers objets
    echo "<h2>5. Derniers objets</h2>";
    $stmt = $pdo->query("SELECT * FROM objet ORDER BY id DESC LIMIT 5");
    $objets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($objets);
    echo "</pre>";
    
    // 6. Test d'insertion
    echo "<h2>6. Test d'insertion</h2>";
    if (isset($_SESSION['user_id']) || isset($_SESSION['user'])) {
        $userId = $_SESSION['user_id'] ?? $_SESSION['user']['id'] ?? null;
        
        if ($userId) {
            echo "User ID: $userId<br>";
            
            // Vérifier si une catégorie existe
            $stmt = $pdo->query("SELECT id FROM categorie LIMIT 1");
            $categorie = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($categorie) {
                echo "Catégorie de test : " . $categorie['id'] . "<br>";
                
                // Test d'insertion
                try {
                    $sql = "INSERT INTO objet (id_proprietaire, nom, description, prix, id_categorie) 
                            VALUES (:id_proprietaire, :nom, :description, :prix, :id_categorie) 
                            RETURNING id";
                    $stmt = $pdo->prepare($sql);
                    $result = $stmt->execute([
                        'id_proprietaire' => $userId,
                        'nom' => 'Test Objet',
                        'description' => 'Description test',
                        'prix' => 10000,
                        'id_categorie' => $categorie['id']
                    ]);
                    
                    if ($result) {
                        $id = $stmt->fetch(PDO::FETCH_ASSOC)['id'];
                        echo "✅ Insertion réussie ! ID: $id<br>";
                        
                        // Supprimer l'objet test
                        $pdo->exec("DELETE FROM objet WHERE id = $id");
                        echo "✅ Objet test supprimé<br>";
                    } else {
                        echo "❌ Échec de l'insertion<br>";
                    }
                } catch (Exception $e) {
                    echo "❌ Erreur : " . $e->getMessage() . "<br>";
                }
            } else {
                echo "❌ Aucune catégorie trouvée dans la base<br>";
            }
        } else {
            echo "❌ User ID introuvable dans la session<br>";
        }
    } else {
        echo "❌ Utilisateur non connecté<br>";
    }
    
} catch (PDOException $e) {
    echo "❌ Erreur de connexion : " . $e->getMessage() . "<br>";
}

echo "<hr>";
echo "<h2>7. Variables serveur</h2>";
echo "REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'N/A') . "<br>";
echo "REQUEST_METHOD: " . ($_SERVER['REQUEST_METHOD'] ?? 'N/A') . "<br>";
?>
