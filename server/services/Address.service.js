import AppDataSource from '../config/db.js';

const ADDRESS_SELECT_FIELDS = 'id, label, lat, lng, color, created_by, created_at';

export async function getAllAddresses() {
  const query = `SELECT ${ADDRESS_SELECT_FIELDS} FROM addresses ORDER BY id DESC`;
  const rows = await AppDataSource.query(query);
  return { rows };
}

export async function createAddress({ label, lat, lng, color = 'red', createdBy }) {
  const query = `
    INSERT INTO addresses (label, lat, lng, color, created_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${ADDRESS_SELECT_FIELDS}
  `;
  const rows = await AppDataSource.query(query, [label, lat, lng, color, createdBy]);
  return { rows };
}

export async function updateAddressById({ id, label, lat, lng }) {
  const query = `
    UPDATE addresses
    SET label = $1, lat = $2, lng = $3
    WHERE id = $4
    RETURNING ${ADDRESS_SELECT_FIELDS}
  `;
  const rows = await AppDataSource.query(query, [label, lat, lng, id]);
  return { rows };
}

export async function deleteAddressById(id) {
  const rows = await AppDataSource.query('DELETE FROM addresses WHERE id = $1 RETURNING id', [id]);
  return { rows };
}
