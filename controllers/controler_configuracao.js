const { pool } = require('../service/conectionDb/service');
const { generateHexId } = require('./controlers_tables');

const getConfiguracoes = async () => {
    try {
      const client = await pool.connect();
      const queryResult = await client.query('SELECT * FROM configuracao');
      const configuracoes = queryResult.rows;
      client.release();
      return JSON.stringify(configuracoes);
    } catch (error) {
      console.error('Erro ao buscar as configurações:', error);
      return null;
    }
  };
  
const createConfiguracao = async (email, senha) => {
    try {
      const client = await pool.connect();

      // Gera um novo ID hexadecimal
      const id = generateHexId(60);

      const queryResult = await client.query(
        'INSERT INTO configuracao (ID, EMAIL, SENHA) VALUES ($1, $2, $3) RETURNING *',
        [id, email, senha]
      );
      const newConfiguracao = queryResult.rows[0];
      client.release();
      return JSON.stringify(newConfiguracao);
    } catch (error) {
      console.error('Erro ao criar uma nova configuração:', error);
      throw error;
    }
};

const deleteConfiguracao = async (id) => {
    try {
      const client = await pool.connect();
      const selectQuery = 'SELECT * FROM configuracao WHERE id = $1';
      const selectResult = await client.query(selectQuery, [id]);
      const deletedConfiguracao = selectResult.rows[0];
  
      const deleteQuery = 'DELETE FROM configuracao WHERE id = $1';
      await client.query(deleteQuery, [id]);
      client.release();
  
      return JSON.stringify(deletedConfiguracao);
    } catch (error) {
      console.error('Erro ao excluir a configuração:', error);
      throw error;
    }
};

const updateConfiguracao = async (id, email, senha) => {
    try {
      const client = await pool.connect();
      let updateClause = '';
      let queryParams = [id];
  
      if (email !== undefined) {
        updateClause += 'EMAIL = $2';
        queryParams.push(email);
      }
  
      if (senha !== undefined) {
        if (updateClause !== '') {
          updateClause += ', ';
        }
        updateClause += 'SENHA = $' + (queryParams.length + 1);
        queryParams.push(senha);
      }
  
      const query = 'UPDATE configuracao SET ' + updateClause + ' WHERE ID = $1 RETURNING *';
      const queryResult = await client.query(query, queryParams);
  
      const updatedConfiguracao = queryResult.rows[0];
      client.release();
  
      return updatedConfiguracao;
    } catch (error) {
      console.error('Erro ao atualizar a configuração:', error);
      throw error;
    }
};

const getConfiguracaoById = async (id) => {
    try {
      const client = await pool.connect();
      const queryResult = await client.query('SELECT * FROM configuracao WHERE id = $1', [id]);
      client.release();
  
      if (queryResult.rows.length > 0) {
        return JSON.stringify(queryResult.rows[0]);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar configuração pelo ID:', error);
      throw error;
    }
};

module.exports = {
    getConfiguracoes,
    createConfiguracao,
    deleteConfiguracao,
    updateConfiguracao,
    getConfiguracaoById
};
  
  
  
  