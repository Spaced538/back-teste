const { pool } = require('../service/conectionDb/service');
const { generateHexId } = require('./controlers_tables');


const getClientes = async () => {
    try {
      const client = await pool.connect();
      const queryResult = await client.query('SELECT * FROM email_cliente');
      const clientes = queryResult.rows;
      client.release();
      return JSON.stringify(clientes);
    } catch (error) {
      console.error('Erro ao buscar os clientes:', error);
      return null;
    }
  };
  
const createCliente = async (nome, sobrenome, email) => {
    try {
      const client = await pool.connect();
      const id = generateHexId(60); // Suponha que a função generateHexId(60) gere o ID.
      const queryResult = await client.query(
        'INSERT INTO email_cliente (ID, NOME, SOBRENOME, EMAIL) VALUES ($1, $2, $3, $4) RETURNING *',
        [id, nome, sobrenome, email]
      );
      const newCliente = queryResult.rows[0];
      client.release();
      return JSON.stringify(newCliente);
    } catch (error) {
      console.error('Erro ao criar um novo cliente:', error);
      throw error;
    }
};
  
  
  const deleteCliente = async (id) => {
    try {
      const client = await pool.connect();
      const selectQuery = 'SELECT * FROM email_cliente WHERE id = $1';
      const selectResult = await client.query(selectQuery, [id]);
      const deletedCliente = selectResult.rows[0];
      const deleteQuery = 'DELETE FROM email_cliente WHERE id = $1';
      await client.query(deleteQuery, [id]);
      client.release();
      return JSON.stringify(deletedCliente);
    } catch (error) {
      console.error('Erro ao excluir o cliente:', error);
      throw error;
    }
  };
  
  const updateCliente = async (id, nome, sobrenome, email) => {
    try {
      const client = await pool.connect();
      let updateClause = '';
      let queryParams = [id];
  
      if (nome !== undefined) {
        updateClause += 'NOME = $2';
        queryParams.push(nome);
      }
      if (sobrenome !== undefined) {
        if (updateClause !== '') {
          updateClause += ', ';
        }
        updateClause += 'SOBRENOME = $' + (queryParams.length + 1);
        queryParams.push(sobrenome);
      }
      if (email !== undefined) {
        if (updateClause !== '') {
          updateClause += ', ';
        }
        updateClause += 'EMAIL = $' + (queryParams.length + 1);
        queryParams.push(email);
      }
  
      const query = 'UPDATE email_cliente SET ' + updateClause + ' WHERE ID = $1 RETURNING *';
      const queryResult = await client.query(query, queryParams);
      const updatedCliente = queryResult.rows[0];
      client.release();
      return JSON.stringify(updatedCliente);
    } catch (error) {
      console.error('Erro ao atualizar o cliente:', error);
      throw error;
    }
  };
  
  const getClienteById = async (id) => {
    try {
      const client = await pool.connect();
      const queryResult = await client.query('SELECT * FROM email_cliente WHERE id = $1', [id]);
      client.release();
      if (queryResult.rows.length > 0) {
        return JSON.stringify(queryResult.rows[0]);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar cliente pelo ID:', error);
      throw error;
    }
  };
  
  module.exports = { 
    createCliente,
    getClientes,
    deleteCliente,
    updateCliente,
    getClienteById
  };
  