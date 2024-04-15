// Import des modules nécessaires
var db = require('./../helpers/db_helpers');
var helper = require('./../helpers/helpers');

// Définition des messages
const msg_success = "successfully";
const msg_fail = "fail";

// Export du contrôleur pour les repas
module.exports.controller = (app, io, socket_list) => {

    // Endpoint pour créer un nouveau repas
    app.post('/api/meals/create', (req, res) => {
        // Obtenir les données de la requête
        var reqObj = req.body;

        // Vérifier les paramètres de la requête
        helper.CheckParameterValid(res, reqObj, ["name", "description", "image", "base_price"], () => {
            // Insérer les données du repas dans la base de données
            db.query('INSERT INTO `menu_item_detail`(`name`, `description`, `image`, `base_price`, `create_date`, `update_date`, `status`) VALUES (?, ?, ?, ?, NOW(), NOW(), 1)', [
                reqObj.name, reqObj.description, reqObj.image, reqObj.base_price
            ], (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return;
                }

                if (result) {
                    res.json({ "status": "1", "message": msg_success });
                } else {
                    res.json({ "status": "0", "message": msg_fail });
                }
            });
        });
    });


    // Endpoint pour récupérer tous les repas
    app.get('/api/meals', (req, res) => {
        // Récupérer tous les repas depuis la base de données
        db.query('SELECT * FROM `menu_item_detail`', (err, result) => {
            if (err) {
                helper.ThrowHtmlError(err, res);
                return;
            }

            if (result.length > 0) {
                res.json({ "status": "1", "payload": result, "message": msg_success });
            } else {
                res.json({ "status": "0", "message": "No meals found" });
            }
        });
    });
    app.get('/api/search', (req, res) => {
        // Obtenir le mot-clé de la requête
        const keyword = req.query.keyword;

        // Effectuer une recherche dans la base de données pour trouver les éléments correspondants
        db.query('SELECT * FROM `menu_item_detail` WHERE `name` LIKE ?', [`%${keyword}%`], (err, result) => {
            if (err) {
                // Gérer les erreurs
                res.status(500).json({ error: err.message });
                return;
            }

            // Renvoyer les résultats de la recherche à l'interface utilisateur
            res.json(result);
        });
    });
    // Endpoint pour mettre à jour un repas existant
    app.put('/api/meals/update/:mealId', (req, res) => {
        // Obtenir l'identifiant du repas à mettre à jour depuis les paramètres de l'URL
        var mealId = req.params.mealId;
        // Obtenir les données mises à jour du repas depuis le corps de la requête
        var reqObj = req.body;

        // Vérifier les paramètres de la requête
        helper.CheckParameterValid(res, reqObj, ["name", "description", "price"], () => {
            // Mettre à jour les données du repas dans la base de données
            db.query('UPDATE `meals` SET `name`=?, `description`=?, `price`=?, `updated_at`=NOW() WHERE `id`=?', [
                reqObj.name, reqObj.description, reqObj.price, mealId
            ], (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return;
                }

                if (result.affectedRows > 0) {
                    res.json({ "status": "1", "message": msg_success });
                } else {
                    res.json({ "status": "0", "message": "Meal not found or already updated" });
                }
            });
        });
    });

    // Endpoint pour supprimer un repas existant
    app.delete('/api/meals/delete/:mealId', (req, res) => {
        // Obtenir l'identifiant du repas à supprimer depuis les paramètres de l'URL
        var mealId = req.params.mealId;

        // Supprimer le repas de la base de données
        db.query('DELETE FROM `meals` WHERE `id`=?', [mealId], (err, result) => {
            if (err) {
                helper.ThrowHtmlError(err, res);
                return;
            }

            if (result.affectedRows > 0) {
                res.json({ "status": "1", "message": msg_success });
            } else {
                res.json({ "status": "0", "message": "Meal not found or already deleted" });
            }
        });
    });
};
