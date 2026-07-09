import AppDataSource from '../config/db.js';
import UserSchema from '../entity/User.entity.js';
import RoleSchema from '../entity/Role.entity.js';
import CuadrillaMiembroSchema from '../entity/CuadrillaMiembro.entity.js';
import bcrypt from 'bcrypt';

const createUser = async (userData) => {
    const { name, email, password, role_id } = userData;

    // Si no viene un role_id, asignamos el ID 2 (Voluntario) por defecto
    const finalRoleId = role_id || 2;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userRepository = AppDataSource.getRepository(UserSchema);
    const newUser = userRepository.create({
        name,
        email,
        password: hashedPassword,
        role_id: finalRoleId
    });
    return await userRepository.save(newUser);
};

const mapUserRow = (row) => {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        role_id: row.role_id,
        role_nombre: row.role_nombre,
        telefono: row.telefono,
        comuna: row.comuna,
        habilidades: row.habilidades,
        herramientas: typeof row.herramientas === 'string' ? JSON.parse(row.herramientas) : (row.herramientas || []),
        cuadrilla: row.cuadrilla_id ? {
            id: row.cuadrilla_id,
            nombre: row.cuadrilla_nombre,
            rol_cuadrilla_id: row.rol_cuadrilla_id,
            rol_cuadrilla_nombre: row.rol_cuadrilla_nombre,
            latitud: row.cuadrilla_latitud ? parseFloat(row.cuadrilla_latitud) : null,
            longitud: row.cuadrilla_longitud ? parseFloat(row.cuadrilla_longitud) : null
        } : null
    };
};

const getAllUsers = async () => {
    const userRepository = AppDataSource.getRepository(UserSchema);
    const result = await userRepository.createQueryBuilder("user")
        .leftJoin("roles", "r", "user.role_id = r.id")
        .leftJoin("cuadrilla_miembros", "cm", "user.id = cm.user_id")
        .leftJoin("cuadrillas", "c", "cm.cuadrilla_id = c.id")
        .leftJoin("roles_cuadrilla", "rc", "cm.rol_cuadrilla_id = rc.id")
        .select([
            "user.id AS id",
            "user.name AS name",
            "user.email AS email",
            "user.role_id AS role_id",
            "r.nombre AS role_nombre",
            "user.telefono AS telefono",
            "user.comuna AS comuna",
            "user.habilidades AS habilidades",
            "c.id AS cuadrilla_id",
            "c.nombre AS cuadrilla_nombre",
            "rc.id AS rol_cuadrilla_id",
            "rc.nombre AS rol_cuadrilla_nombre",
            "c.latitud AS cuadrilla_latitud",
            "c.longitud AS cuadrilla_longitud",
            `COALESCE(
                (SELECT json_agg(json_build_object('id', h.id, 'nombre', h.nombre, 'estado', h.estado)) 
                 FROM herramientas h 
                 WHERE h.assigned_to = user.id),
                '[]'::json
            ) AS herramientas`
        ])
        .orderBy("user.name", "ASC")
        .getRawMany();

    return result.map(mapUserRow);
};

const getUserById = async (id) => {
    const userRepository = AppDataSource.getRepository(UserSchema);
    const row = await userRepository.createQueryBuilder("user")
        .leftJoin("roles", "r", "user.role_id = r.id")
        .leftJoin("cuadrilla_miembros", "cm", "user.id = cm.user_id")
        .leftJoin("cuadrillas", "c", "cm.cuadrilla_id = c.id")
        .leftJoin("roles_cuadrilla", "rc", "cm.rol_cuadrilla_id = rc.id")
        .select([
            "user.id AS id",
            "user.name AS name",
            "user.email AS email",
            "user.role_id AS role_id",
            "r.nombre AS role_nombre",
            "user.telefono AS telefono",
            "user.comuna AS comuna",
            "user.habilidades AS habilidades",
            "c.id AS cuadrilla_id",
            "c.nombre AS cuadrilla_nombre",
            "rc.id AS rol_cuadrilla_id",
            "rc.nombre AS rol_cuadrilla_nombre",
            "c.latitud AS cuadrilla_latitud",
            "c.longitud AS cuadrilla_longitud",
            `COALESCE(
                (SELECT json_agg(json_build_object('id', h.id, 'nombre', h.nombre, 'estado', h.estado)) 
                 FROM herramientas h 
                 WHERE h.assigned_to = user.id),
                '[]'::json
            ) AS herramientas`
        ])
        .where("user.id = :id", { id: parseInt(id, 10) })
        .getRawOne();

    return mapUserRow(row);
};

const deleteUser = async (id) => {
    const userId = parseInt(id, 10);
    // Eliminar membresía de cuadrilla
    await AppDataSource.createQueryBuilder()
        .delete()
        .from("cuadrilla_miembros")
        .where("user_id = :userId", { userId })
        .execute();

    const userRepository = AppDataSource.getRepository(UserSchema);
    await userRepository.delete(userId);
    return { message: 'Usuario eliminado' };
};

const updateUser = async (id, userData) => {
    const userRepository = AppDataSource.getRepository(UserSchema);
    const user = await userRepository.findOneBy({ id: parseInt(id, 10) });
    if (!user) {
        throw new Error("Usuario no encontrado");
    }
    userRepository.merge(user, userData);
    return await userRepository.save(user);
};

const getSystemRoles = async () => {
    const roleRepository = AppDataSource.getRepository(RoleSchema);
    return await roleRepository.find({
        order: { id: "ASC" }
    });
};

const getAvailableVolunteers = async () => {
    const userRepository = AppDataSource.getRepository(UserSchema);
    const subQuery = AppDataSource.getRepository(CuadrillaMiembroSchema)
        .createQueryBuilder("cm")
        .select("cm.user_id");

    return await userRepository.createQueryBuilder("user")
        .leftJoin("roles", "r", "user.role_id = r.id")
        .select([
            "user.id AS id",
            "user.name AS name",
            "user.email AS email",
            "user.role_id AS role_id",
            "r.nombre AS role_nombre",
            "user.telefono AS telefono",
            "user.comuna AS comuna",
            "user.habilidades AS habilidades"
        ])
        .where("user.role_id = 2")
        .andWhere("user.id NOT IN (" + subQuery.getQuery() + ")")
        .orderBy("user.name", "ASC")
        .getRawMany();
};

const userService = {
    createUser,
    getAllUsers,
    getUserById,
    getAvailableVolunteers,
    deleteUser,
    updateUser,
    getSystemRoles
};

export {
    createUser,
    getAllUsers,
    getUserById,
    getAvailableVolunteers,
    deleteUser,
    updateUser,
    getSystemRoles
};

export default userService;
