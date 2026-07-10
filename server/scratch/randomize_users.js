const pool = require('../config/db');

const firstNames = [
  "Juan", "María", "Carlos", "Ana", "Diego", "Valentina", "Nicolás", "Javiera", 
  "Sebastián", "Camila", "Felipe", "Francisca", "Andrés", "Bárbara", "Cristián",
  "Gabriel", "Daniela", "Matías", "Isabella", "Joaquín", "Paz", "Ricardo", "Elena",
  "Rodrigo", "Sofía", "Patricio", "Carla", "Gonzalo", "Loreto", "Eduardo"
];

const lastNames = [
  "Pérez", "González", "Soto", "Morales", "Silva", "Rojas", "Tapia", "Fuentes", 
  "Reyes", "Castro", "Lagos", "Herrera", "Muñoz", "Valenzuela", "Vera",
  "Contreras", "Martínez", "Sepúlveda", "Bravo", "Gallardo", "Godoy", "Salinas",
  "Araya", "Donoso", "Orellana", "Henríquez", "Palma", "López", "Guzmán", "Zúñiga"
];

const comunas = ["Santiago", "Maipú", "Renca", "Lo Espejo", "La Florida", "Peñalolén", "Quilicura", "Pudahuel", "Independencia", "Recoleta"];
const habilidadesList = ["Carpintería", "Gasfitería", "Primeros Auxilios", "Liderazgo", "Carga Pesada", "Logística", "Electricidad", "Pintura", "Cubicación"];

const randomize = async () => {
  try {
    const res = await pool.query('SELECT id FROM users WHERE role_id = 2');
    const users = res.rows;

    for (let i = 0; i < users.length; i++) {
      // Intentar generar nombres más únicos combinando
      const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const randomSecondLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      const randomName = `${randomFirstName} ${randomLastName} ${randomSecondLastName}`;
      const randomComuna = comunas[Math.floor(Math.random() * comunas.length)];
      
      // Aleatorizar skills (1 a 3)
      const numSkills = Math.floor(Math.random() * 3) + 1;
      const shuffledSkills = [...habilidadesList].sort(() => 0.5 - Math.random());
      const randomSkills = shuffledSkills.slice(0, numSkills).join(', ');
      
      const randomPhone = `+56 9 ${Math.floor(10000000 + Math.random() * 90000000)}`;

      await pool.query(
        'UPDATE users SET name = $1, comuna = $2, habilidades = $3, telefono = $4 WHERE id = $5',
        [randomName, randomComuna, randomSkills, randomPhone, users[i].id]
      );
    }

    console.log(`✅ ${users.length} usuarios actualizados con nombres únicos mejorados.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

randomize();
