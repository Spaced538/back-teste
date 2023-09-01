const { pool } = require('../service/conectionDb/service');
const { generateHexId } = require('./controlers_tables');

const getConsultoria = async () => {
    try {
      const client = await pool.connect();
      const queryResult = await client.query('SELECT * FROM consultoria');
      const consultorias = queryResult.rows;
      client.release();
      return JSON.stringify(consultorias);
    } catch (error) {
      console.error('Erro ao buscar as consultorias:', error);
      return null;
    }
  };
  
  const createConsultoria = async (texto1, texto2, texto3, texto4) => {
    try {
      const client = await pool.connect();
      const id = generateHexId(60);
      const queryResult = await client.query(
        'INSERT INTO consultoria (ID, TEXTO1, TEXTO2, TEXTO3, TEXTO4) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [id, texto1, texto2, texto3, texto4]
      );
      const newConsultoria = queryResult.rows[0];
      client.release();
      return JSON.stringify(newConsultoria);
    } catch (error) {
      console.error('Erro ao criar uma nova consultoria:', error);
      throw error;
    }
  };
  
  const deleteConsultoria = async (id) => {
    try {
      const client = await pool.connect();
      const selectQuery = 'SELECT * FROM consultoria WHERE id = $1';
      const selectResult = await client.query(selectQuery, [id]);
      const deletedConsultoria = selectResult.rows[0];
      const deleteQuery = 'DELETE FROM consultoria WHERE id = $1';
      await client.query(deleteQuery, [id]);
      client.release();
      return JSON.stringify(deletedConsultoria);
    } catch (error) {
      console.error('Erro ao excluir a consultoria:', error);
      throw error;
    }
  };
  
  const updateConsultoria = async (id, texto1, texto2, texto3, texto4) => {
    try {
      const client = await pool.connect();
      let updateClause = '';
      let queryParams = [id];
  
      if (texto1 !== undefined) {
        updateClause += 'TEXTO1 = $2';
        queryParams.push(texto1);
      }
      if (texto2 !== undefined) {
        if (updateClause !== '') {
          updateClause += ', ';
        }
        updateClause += 'TEXTO2 = $' + (queryParams.length + 1);
        queryParams.push(texto2);
      }
      if (texto3 !== undefined) {
        if (updateClause !== '') {
          updateClause += ', ';
        }
        updateClause += 'TEXTO3 = $' + (queryParams.length + 1);
        queryParams.push(texto3);
      }
      if (texto4 !== undefined) {
        if (updateClause !== '') {
          updateClause += ', ';
        }
        updateClause += 'TEXTO4 = $' + (queryParams.length + 1);
        queryParams.push(texto4);
      }
  
      const query = 'UPDATE consultoria SET ' + updateClause + ' WHERE ID = $1 RETURNING *';
      const queryResult = await client.query(query, queryParams);
      const updatedConsultoria = queryResult.rows[0];
      client.release();
      return updatedConsultoria;
    } catch (error) {
      console.error('Erro ao atualizar a consultoria:', error);
      throw error;
    }
  };
  
  const getConsultoriaById = async (id) => {
    try {
      const client = await pool.connect();
      const queryResult = await client.query('SELECT * FROM consultoria WHERE id = $1', [id]);
      client.release();
      if (queryResult.rows.length > 0) {
        return JSON.stringify(queryResult.rows[0]);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar consultoria pelo ID:', error);
      throw error;
    }
};

module.exports = { 

    createConsultoria,
    getConsultoria,
    deleteConsultoria,
    updateConsultoria,
    getConsultoriaById

};