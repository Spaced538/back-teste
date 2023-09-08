const { pool } = require('../service/conectionDb/service');
const { generateHexId } = require('./controlers_tables');

const getValor = async () => {
    try {
      const client = await pool.connect();
  
      const queryResult = await client.query('SELECT * FROM valor');
  
      const valores = queryResult.rows;
  
      client.release();
  
      return JSON.stringify(valores);
    } catch (error) {
      console.error('Erro ao buscar valores:', error);
      return null;
    }
  };
  
  const createValor = async (texto) => {
    try {
      const client = await pool.connect();
      const id = generateHexId(60);
  
      const queryResult = await client.query(
        'INSERT INTO valor (ID, TEXTO) VALUES ($1, $2) RETURNING *',
        [id, texto]
      );
  
      const novoValor = queryResult.rows[0];
  
      client.release();
  
      return JSON.stringify(novoValor);
    } catch (error) {
      console.error('Erro ao criar um novo valor:', error);
      throw error;
    }
  };
  
  const deleteValor = async (id) => {
    try {
      const client = await pool.connect();
  
      const selectQuery = 'SELECT * FROM valor WHERE id = $1';
      const selectResult = await client.query(selectQuery, [id]);
      const deletedValor = selectResult.rows[0];
  
      const deleteQuery = 'DELETE FROM valor WHERE id = $1';
      await client.query(deleteQuery, [id]);
  
      client.release();
  
      return JSON.stringify(deletedValor);
    } catch (error) {
      console.error('Erro ao excluir valor:', error);
      throw error;
    }
  };
  
  const updateValor = async (id, texto) => {
    try {
      const client = await pool.connect();
      let updateClause = '';
      let queryParams = [id];
  
      if (texto !== undefined) {
        updateClause += 'TEXTO = $2';
        queryParams.push(texto);
      }
  
      const query = 'UPDATE valor SET ' + updateClause + ' WHERE ID = $1 RETURNING *';
      const queryResult = await client.query(query, queryParams);
  
      const valorAtualizado = queryResult.rows[0];
  
      client.release();
  
      return valorAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar valor:', error);
      throw error;
    }
  };
  
  const getValorById = async (id) => {
    try {
      const client = await pool.connect();
  
      const queryResult = await client.query('SELECT * FROM valor WHERE id = $1', [id]);
  
      client.release();
  
      if (queryResult.rows.length > 0) {
        return JSON.stringify(queryResult.rows[0]);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar valor pelo ID:', error);
      throw error;
    }
  };
  

module.exports = {
    createValor,
    getValor,
    deleteValor,
    updateValor,
    getValorById
};
