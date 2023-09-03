const { pool } = require('../service/conectionDb/service');
const { generateHexId } = require('./controlers_tables');
const { uploadImageToStorage, deleteImageFromStorage } = require('./controler_images');

// Função para buscar todos os agendamentos da tabela "agendamentos"
const getAgendamentos = async () => {
    try {
      // Obtém uma conexão do pool
      const client = await pool.connect();
  
      // Executa a consulta para buscar todos os agendamentos
      const queryResult = await client.query('SELECT * FROM agendamentos');
  
      // Obtém os agendamentos encontrados
      const agendamentos = queryResult.rows;
  
      // Libera a conexão de volta para o pool
      client.release();
  
      // Retorna os agendamentos como um JSON     
      return JSON.stringify(agendamentos);
    } catch (error) {
      console.error('Erro ao buscar os usuários da tabela "agendamentos":', error);
      return null; // Em caso de erro, pode retornar null ou um valor adequado
    }
};
  
const createAgendamentos = async (nome, email, telefone, provincia, servico, mais_info) => {
    try {
      // Obtém uma conexão do pool
      const client = await pool.connect();
  
      // Gera um novo ID hexadecimal
      const id = generateHexId(60);
  
      // Executa a consulta para inserir um novo agendamento com o ID gerado
      const queryResult = await client.query(
        'INSERT INTO agendamentos (ID, NOME, EMAIL, TELEFONE, PROVINCIA, SERVICO, MAIS_INFORMACAO) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [id, nome, email, telefone, provincia, servico, mais_info]
      );
  
      // Obtém o agendamento criado
      const newAgendamento = queryResult.rows[0];
  
      client.release();
  
      // Retorna o novo agendamento como JSON
      return JSON.stringify(newAgendamento);
    } catch (error) {
      console.error('Erro ao criar um novo agendamento:', error);
      throw error; // Lança o erro para que seja tratado externamente, se necessário
    }
};
  
  
  const deleteAgendamentos = async (id) => {
    try {
        const client = await pool.connect();
  
        // Obter o agendamento a ser excluído antes de removê-lo
        const selectQuery = 'SELECT * FROM agendamentos WHERE id = $1';
        const selectResult = await client.query(selectQuery, [id]);
        const deletedAgendamento = selectResult.rows[0];
  
        // Excluir o Adm
        const deleteQuery = 'DELETE FROM agendamentos WHERE id = $1';
        await client.query(deleteQuery, [id]);
        
        client.release();
  
        // Retorna o agendamento excluído como JSON
        return JSON.stringify(deletedAgendamento); 
    } catch (error) {
        console.error('Erro ao excluir o agendamento:', error);
        throw error;
    }
  };
  
  // Função para atualizar um agendamento na tabela "agendamentos"
  const updateAgendamentos = async (id, nome, email, telefone, provincia, servico, mais_info) => {
    try {
      // Obtém uma conexão do pool
      const client = await pool.connect();
  
      // Constrói a parte da consulta que será modificada de acordo com os valores fornecidos
      let updateClause = '';
      let queryParams = [id];
  
      if (nome !== undefined) {
        updateClause += 'NOME = $2';
        queryParams.push(nome);
      }
  
      if (email !== undefined) {
        if (updateClause !== '') {
          updateClause += ', ';
        }
        updateClause += 'EMAIL = $' + (queryParams.length + 1);
        queryParams.push(email);
      }
  
      if (telefone !== undefined) {
        if (updateClause !== '') {
          updateClause += ', ';
        }
        updateClause += 'TELEFONE = $' + (queryParams.length + 1);
        queryParams.push(telefone);
      }
  
      if (provincia !== undefined) {
        if (updateClause !== '') {
          updateClause += ', ';
        }
        updateClause += 'PROVINCIA = $' + (queryParams.length + 1);
        queryParams.push(provincia);
      }
  
      if (servico !== undefined) {
        if (updateClause !== '') {
          updateClause += ', ';
        }
        updateClause += 'SERVICO = $' + (queryParams.length + 1);
        queryParams.push(servico);
      }
  
      if (mais_info !== undefined) {
        if (updateClause !== '') {
          updateClause += ', ';
        }
        updateClause += 'MAIS_INFORMACAO = $' + (queryParams.length + 1);
        queryParams.push(mais_info);
      }
  
      // Executa a consulta para atualizar o agendamento
      const query = 'UPDATE agendamentos SET ' + updateClause + ' WHERE ID = $1 RETURNING *';
      const queryResult = await client.query(query, queryParams);
  
      // Obtém o agendamento atualizado
      const updatedAgendamento = queryResult.rows[0];
  
      // Libera a conexão de volta para o pool
      client.release();
  
      return updatedAgendamento; // Retorna o agendamento atualizado
    } catch (error) {
      console.error('Erro ao atualizar o agendamento:', error);
      throw error; // Lembre-se de relançar o erro para que ele possa ser tratado fora da função
    }
};
  
const getAgendamentoById = async (id) => {
    try {
      // Obtém uma conexão do pool
      const client = await pool.connect();
  
      // Executa a consulta para buscar o agendamento pelo ID
      const queryResult = await client.query('SELECT * FROM agendamentos WHERE id = $1', [id]);
  
      // Libera a conexão de volta para o pool
      client.release();
  
      if (queryResult.rows.length > 0) {
        // Retorna o agendamento encontrado como um objeto JSON
        return JSON.stringify(queryResult.rows[0]);
      } else {
        return null; // Retorna null se o agendamento não for encontrado
      }
    } catch (error) {
      console.error('Erro ao buscar agendamento pelo ID:', error);
      throw error;
    }
};

module.exports = {

    createAgendamentos,
    getAgendamentos,
    deleteAgendamentos,
    updateAgendamentos,
    getAgendamentoById

};