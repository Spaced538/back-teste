const { pool } = require('../service/conectionDb/service');
const { generateHexId } = require('./controlers_tables');


const getVisibilidade = async () => {
    try {
      const client = await pool.connect();
      const queryResult = await client.query('SELECT * FROM visibilidade');
      const visibilidades = queryResult.rows;
      client.release();
      return JSON.stringify(visibilidades);
    } catch (error) {
      console.error('Erro ao buscar as visibilidades:', error);
      return null;
    }
  };
  
const updateVisibilidadeAtivo = async (id, ativo) => {
    try {
      const client = await pool.connect();
      const query = 'UPDATE visibilidade SET ATIVO = $2 WHERE ID = $1 RETURNING *';
      const queryParams = [id, ativo];
      const queryResult = await client.query(query, queryParams);
      const updatedVisibilidade = queryResult.rows[0];
      client.release();
      return JSON.stringify(updatedVisibilidade);
    } catch (error) {
      console.error('Erro ao atualizar o campo "ativo" da visibilidade:', error);
      throw error;
    }
};
  
  
  const getVisibilidadeById = async (id) => {
    try {
      const client = await pool.connect();
      const queryResult = await client.query('SELECT * FROM visibilidade WHERE id = $1', [id]);
      client.release();
      if (queryResult.rows.length > 0) {
        return JSON.stringify(queryResult.rows[0]);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar visibilidade pelo ID:', error);
      throw error;
    }
  };

const createVisibilidade = async (nomeSecao, ativo) => {
    try {
      const client = await pool.connect();
      const id = generateHexId(60);
      const queryResult = await client.query(
        'INSERT INTO visibilidade (ID, NOME_SECAO, ATIVO) VALUES ($1, $2, $3) RETURNING *',
        [id, nomeSecao, ativo]
      );
      const newVisibilidade = queryResult.rows[0];
      client.release();
      return JSON.stringify(newVisibilidade);
    } catch (error) {
      console.error('Erro ao criar uma nova visibilidade:', error);
      throw error;
    }
};
  
  
  module.exports = {
    getVisibilidade,
    updateVisibilidadeAtivo,
    getVisibilidadeById,
    createVisibilidade
  };
  

