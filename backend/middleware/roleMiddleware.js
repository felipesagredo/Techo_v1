const verifyRole = (rolesPermitidos) => {
  return (req, res, next) => {

    const userRole = req.user?.role;

    if (!rolesPermitidos.includes(userRole)) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos',
      });
    }

    next();
  };
};

module.exports = verifyRole;