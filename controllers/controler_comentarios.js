const { pool } = require('../service/conectionDb/service');
const { generateHexId } = require('./controlers_tables');

const getComentarios = async (idPost) => {
    try {
      // Obtém uma conexão do pool
      const client = await pool.connect();
  
      // Inicializa a variável queryText com a consulta SQL filtrando por ID_POST
      const queryText = 'SELECT * FROM comentarios WHERE ID_POST = $1';
  
      // Executa a consulta SQL com o ID_POST fornecido como parâmetro
      const queryResult = await client.query(queryText, [idPost]);
  
      // Obtém os comentários resultantes da consulta
      const comentarios = queryResult.rows;
  
      // Libera a conexão de volta para o pool
      client.release();
  
      // Retorna os comentários encontrados
      return comentarios;
    } catch (error) {
      console.error('Erro ao buscar os comentários da tabela "comentario":', error);
      throw error;
    }
};
  
const createComentario = async (idPost, texto) => {
    try {
        const client = await pool.connect();
        const id = generateHexId(60);
        const queryResult = await client.query(
        'INSERT INTO comentarios (ID, ID_POST, TEXTO) VALUES ($1, $2, $3) RETURNING *',
        [id, idPost, texto]
        );
        const newComentario = queryResult.rows[0];
        client.release();
        return newComentario;
    } catch (error) {
        console.error('Erro ao criar um novo comentário:', error);
        throw error;
    }
};
  
const deleteComentario = async (id) => {
    try {
        const client = await pool.connect();
        const selectQuery = 'SELECT * FROM comentarios WHERE id = $1';
        const selectResult = await client.query(selectQuery, [id]);
        const deletedComentario = selectResult.rows[0];
        const deleteQuery = 'DELETE FROM comentarios WHERE id = $1';
        await client.query(deleteQuery, [id]);
        client.release();
        return deletedComentario;
    } catch (error) {
        console.error('Erro ao excluir o Comentário:', error);
        throw error;
    }
};
  
const updateComentario = async (id, texto) => {
    try {
      const client = await pool.connect();
      let updateClause = '';
      let queryParams = [id];
  
      if (texto !== undefined) {
        updateClause += 'TEXTO = $2';
        queryParams.push(texto);
      }
  
      if (updateClause !== '') {
        // Só executa a atualização se pelo menos um campo for fornecido
        const query = 'UPDATE comentarios SET ' + updateClause + ' WHERE ID = $1 RETURNING *';
        const queryResult = await client.query(query, queryParams);
        const updatedComentario = queryResult.rows[0];
        client.release();
        return updatedComentario;
      } else {
        // Não há campos para atualizar, retorna o comentário existente
        const queryResult = await client.query('SELECT * FROM comentarios WHERE ID = $1', [id]);
        const existingComentario = queryResult.rows[0];
        client.release();
        return existingComentario;
      }
    } catch (error) {
      console.error('Erro ao atualizar o comentário:', error);
      throw error;
    }
};
  

const getComentarioById = async (id) => {
    try {
      const client = await pool.connect();
      const queryResult = await client.query('SELECT * FROM comentarios WHERE id = $1', [id]);
      client.release();
      if (queryResult.rows.length > 0) {
        return JSON.stringify(queryResult.rows[0]);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar comentário pelo ID:', error);
      throw error;
    }
  };

module.exports = {

    getComentarios,
    createComentario,
    deleteComentario,
    updateComentario,
    getComentarioById

};
  
