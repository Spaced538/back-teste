const { pool } = require('../service/conectionDb/service');


// Função para buscar todos os usuários da tabela "usuarios"
const getUsers = async () => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Executa a consulta para buscar todos os usuários
    const queryResult = await client.query('SELECT * FROM usuarios');

    // Obtém os usuários encontrados
    const users = queryResult.rows;

    // Libera a conexão de volta para o pool
    client.release();

    // Retorna os usuários como um JSON     
    return JSON.stringify(users);
  } catch (error) {
    console.error('Erro ao buscar os usuários da tabela "users":', error);
    return null; // Em caso de erro, pode retornar null ou um valor adequado
  }
};

const createUser = async (nome, email, idade, data_c) => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Obtém o último valor do ID na tabela "usuarios"
    const lastIdQuery = 'SELECT MAX(id) FROM usuarios';
    const lastIdResult = await client.query(lastIdQuery);
    const lastId = lastIdResult.rows[0].max;

    // Reorganiza a sequência de incremento automático da coluna "id"
    const resetQuery = `ALTER SEQUENCE usuarios_id_seq RESTART WITH ${lastId + 1}`;
    await client.query(resetQuery);

    // Executa a consulta para inserir um novo usuário
    const queryResult = await client.query(
      'INSERT INTO usuarios (NOME, EMAIL, IDADE, DATA_CADASTRO) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, idade, data_c]
    );

    // Obtém o usuário criado
    const newUser = queryResult.rows[0];

    client.release();

    // Retorna o novo usuário como JSON
    return JSON.stringify(newUser);
  } catch (error) {
    console.error('Erro ao criar um novo usuário:', error);
    throw error; // Lança o erro para que seja tratado externamente, se necessário
  }
};


const deleteUser = async (id) => {
  try {
    const client = await pool.connect();

    // Obter o usuário a ser excluído antes de removê-lo
    const selectQuery = 'SELECT * FROM usuarios WHERE id = $1';
    const selectResult = await client.query(selectQuery, [id]);
    const deletedUser = selectResult.rows[0];

    // Excluir o usuário
    const deleteQuery = 'DELETE FROM usuarios WHERE id = $1';
    await client.query(deleteQuery, [id]);

    // Obter o ID máximo atualizado
    const maxIdQuery = 'SELECT MAX(id) FROM usuarios';
    const maxIdResult = await client.query(maxIdQuery);
    const maxId = maxIdResult.rows[0].max;

    // Atualizar os IDs subsequentes
    const updateQuery = `
      UPDATE usuarios
      SET id = id - 1
      WHERE id > $1 AND id <= $2
    `;
    await client.query(updateQuery, [id, maxId]);

    console.log('Usuário excluído com sucesso.');
    
    client.release();

    // Retorna o usuário excluído como JSON
    return JSON.stringify(deletedUser);
  } catch (error) {
    console.error('Erro ao excluir o usuário:', error);
    throw error;
  }
};



// Função para atualizar um usuário na tabela "usuarios"
const updateUser = async (id, name, email, idade, data_c) => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Executa a consulta para atualizar o usuário
    const queryResult = await client.query(
      'UPDATE usuarios SET NOME = $1, EMAIL = $2, IDADE = $3, DATA_CADASTRO = $4 WHERE ID = $5 RETURNING *',
      [name, email, idade, data_c, id]
    );

    // Obtém o usuário atualizado
    const updatedUser = queryResult.rows[0];

    // Exibe o usuário atualizado
    console.log('Usuário atualizado:');
    console.log(updatedUser);

    // Libera a conexão de volta para o pool
    client.release();
  } catch (error) {
    console.error('Erro ao atualizar o usuário:', error);
  }
};

module.exports = {
  getUsers,
  createUser,
  deleteUser,
  updateUser
};
