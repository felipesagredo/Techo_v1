export const ROLE_IDS = {
	admin: 1,
	voluntario: 2,
};

const resolveRoleId = (role) => {
	if (typeof role === 'number') {
		return role;
	}

	if (typeof role === 'string') {
		const normalizedRole = role.toLowerCase().trim();
		return ROLE_IDS[normalizedRole];
	}

	return undefined;
};

const authorizeRoles = (...allowedRoles) => {
	const allowedRoleIds = allowedRoles
		.map(resolveRoleId)
		.filter((roleId) => roleId !== undefined);

	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ error: 'Acceso denegado. No hay sesión activa.' });
		}

		if (!allowedRoleIds.includes(req.user.role_id)) {
			return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
		}

		next();
	};
};

export default authorizeRoles;
