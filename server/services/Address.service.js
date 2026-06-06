const pool = require('../config/db');

const ADDRESS_SELECT_FIELDS = 'id, label, lat, lng, color, created_by, created_at';

async function getAllAddresses() {
  const query = `SELECT ${ADDRESS_SELECT_FIELDS} FROM addresses ORDER BY id DESC`;
  return pool.query(query);
}

async function createAddress({ label, lat, lng, color = 'red', createdBy }) {
  const query = `
    INSERT INTO addresses (label, lat, lng, color, created_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${ADDRESS_SELECT_FIELDS}
  `;
  return pool.query(query, [label, lat, lng, color, createdBy]);
}

async function updateAddressById({ id, label, lat, lng }) {
  const query = `
    UPDATE addresses
    SET label = $1, lat = $2, lng = $3
    WHERE id = $4
    RETURNING ${ADDRESS_SELECT_FIELDS}
  `;
  return pool.query(query, [label, lat, lng, id]);
}

async function deleteAddressById(id) {
  return pool.query('DELETE FROM addresses WHERE id = $1 RETURNING id', [id]);
}

module.exports = {
  getAllAddresses,
  createAddress,
  updateAddressById,
  deleteAddressById,
};
