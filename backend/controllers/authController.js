import AppDataSource from '../config/db.js';
import UserSchema from '../entity/User.entity.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { name, email, password, role_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const finalRoleId = role_id || 2; // Por defecto voluntario
    
    const userRepository = AppDataSource.getRepository(UserSchema);
    const newUser = userRepository.create({
      name,
      email,
      password: hashedPassword,
      role_id: finalRoleId
    });
    const savedUser = await userRepository.save(newUser);
    
    res.status(201).json({ 
      message: 'Usuario registrado', 
      user: { id: savedUser.id, email: savedUser.email, role_id: savedUser.role_id } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el registro' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRepository = AppDataSource.getRepository(UserSchema);
    const user = await userRepository.findOneBy({ email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const jwtSecret = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || 'secret_key_123';
    const token = jwt.sign({ id: user.id, email: user.email, role_id: user.role_id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, name: user.name, role_id: user.role_id }, message: 'Inicio de Sesion Exitoso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el login' });
  }
};

export default { register, login };
