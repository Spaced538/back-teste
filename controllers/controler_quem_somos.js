const { pool } = require('../service/conectionDb/service');
const { generateHexId } = require('./controlers_tables');


const getQuemSomos = async () => {
    try {
      const client = await pool.connect();
  
      const queryResult = await client.query('SELECT * FROM quem_somos');
  
      const quemSomos = queryResult.rows;
  
      client.release();
  
      return JSON.stringify(quemSomos);
    } catch (error) {
      console.error('Erro ao buscar informações de "quem_somos":', error);
      return null;
    }
};
  
const createQuemSomos = async (texto) => {
    try {
      const client = await pool.connect();
      const id = generateHexId(60);
  
      const queryResult = await client.query(
        'INSERT INTO quem_somos (ID, TEXTO) VALUES ($1, $2) RETURNING *',
        [id, texto]
      );
  
      const newQuemSomos = queryResult.rows[0];
  
      client.release();
  
      return JSON.stringify(newQuemSomos);
    } catch (error) {
      console.error('Erro ao criar uma nova informação em "quem_somos":', error);
      throw error;
    }
};
  
const deleteQuemSomos = async (id) => {
    try {
      const client = await pool.connect();
  
      const selectQuery = 'SELECT * FROM quem_somos WHERE id = $1';
      const selectResult = await client.query(selectQuery, [id]);
      const deletedQuemSomos = selectResult.rows[0];
  
      const deleteQuery = 'DELETE FROM quem_somos WHERE id = $1';
      await client.query(deleteQuery, [id]);
  
      client.release();
  
      return JSON.stringify(deletedQuemSomos);
    } catch (error) {
      console.error('Erro ao excluir informação em "quem_somos":', error);
      throw error;
    }
};
  
const updateQuemSomos = async (id, texto) => {
    try {
      const client = await pool.connect();
      let updateClause = '';
      let queryParams = [id];
  
      if (texto !== undefined) {
        updateClause += 'TEXTO = $2';
        queryParams.push(texto);
      }
  
      const query = 'UPDATE quem_somos SET ' + updateClause + ' WHERE ID = $1 RETURNING *';
      const queryResult = await client.query(query, queryParams);
  
      const updatedQuemSomos = queryResult.rows[0];
  
      client.release();
  
      return updatedQuemSomos;
    } catch (error) {
      console.error('Erro ao atualizar informações em "quem_somos":', error);
      throw error;
    }
};
  
const getQuemSomosById = async (id) => {
    try {
      const client = await pool.connect();
  
      const queryResult = await client.query('SELECT * FROM quem_somos WHERE id = $1', [id]);
  
      client.release();
  
      if (queryResult.rows.length > 0) {
        return JSON.stringify(queryResult.rows[0]);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar informações de "quem_somos" pelo ID:', error);
      throw error;
    }
};
  
module.exports = {
    getQuemSomos,
    createQuemSomos,
    deleteQuemSomos,
    updateQuemSomos,
    getQuemSomosById
};
  