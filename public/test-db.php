<?php
$ds = DIRECTORY_SEPARATOR;
require(__DIR__ . $ds . '..' . $ds . 'vendor' . $ds . 'autoload.php');
require(__DIR__ . $ds . '..' . $ds . 'app' . $ds . 'config' . $ds . 'bootstrap.php');

try {
    $db = Flight::db();
    echo "✅ Connexion réussie !<br>";
    
    $stmt = $db->query("SELECT COUNT(*) as total FROM objet");
    $result = $stmt->fetch();
    echo "Nombre d'objets dans la base : " . $result['total'] . "<br>";
    
    $stmt = $db->query("SELECT id, nom, etat FROM objet LIMIT 5");
    $objets = $stmt->fetchAll();
    echo "<pre>";
    print_r($objets);
    echo "</pre>";
    
} catch (Exception $e) {
    echo "❌ ERREUR : " . $e->getMessage();
}