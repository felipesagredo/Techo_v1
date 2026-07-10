const userService = require('../services/userService');

(async () => {
    try {
        console.log("--- Obteniendo todos los usuarios enriquecidos ---");
        const users = await userService.getAllUsers();
        console.log(JSON.stringify(users.slice(0, 3), null, 2)); // mostrar los primeros 3 usuarios

        console.log("\n--- Obteniendo roles del sistema ---");
        const roles = await userService.getSystemRoles();
        console.log(roles);

        console.log("\n--- Obteniendo voluntarios disponibles ---");
        const available = await userService.getAvailableVolunteers();
        console.log(JSON.stringify(available.slice(0, 3), null, 2));

        console.log("\n✅ Pruebas de integración exitosas");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error durante la verificación:", err);
        process.exit(1);
    }
})();
