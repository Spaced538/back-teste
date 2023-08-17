const { pool } = require('../service/conectionDb/service');
const crypto = require('crypto');

function generateHexId(length) {
    const byteLength = Math.ceil(length / 2); // Cada byte vira dois caracteres hexadecimais
    const randomBytes = crypto.randomBytes(byteLength);
    return randomBytes.toString('hex').slice(0, length);
}

// Função para buscar todos os usuários da tabela "adm"
const getAdms = async () => {
    try {
      // Obtém uma conexão do pool
      const client = await pool.connect();
  
      // Executa a consulta para buscar todos os adms
      const queryResult = await client.query('SELECT * FROM adm');
  
      // Obtém os usuários encontrados
      const users = queryResult.rows;
  
      // Libera a conexão de volta para o pool
      client.release();
  
      // Retorna os usuários como um JSON     
      return JSON.stringify(users);
    } catch (error) {
      console.error('Erro ao buscar os usuários da tabela "ADM":', error);
      return null; // Em caso de erro, pode retornar null ou um valor adequado
    }
};

const createAdm = async (usuario, email, senha) => {
  try {
    // Verifica se já existe um uadm com o email fornecido
    const existingUser = await pool.query('SELECT * FROM adm WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new Error('Já existe um usuário com esse email.');
    }

    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Gera um novo ID hexadecimal
    const id = generateHexId(60);

    // Executa a consulta para inserir um novo adm com o ID gerado
    const queryResult = await client.query(
      'INSERT INTO adm (ID, USUARIO, EMAIL, SENHA) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, usuario, email, senha]
    );

    // Obtém o adm criado
    const newUser = queryResult.rows[0];

    client.release();

    // Retorna o novo adm como JSON
    return JSON.stringify(newUser);
  } catch (error) {
    console.error('Erro ao criar um novo usuário:', error);
    throw error; // Lança o erro para que seja tratado externamente, se necessário
  }
};

const deleteAdm = async (id) => {
    try {
        const client = await pool.connect();

        // Obter o Adm a ser excluído antes de removê-lo
        const selectQuery = 'SELECT * FROM adm WHERE id = $1';
        const selectResult = await client.query(selectQuery, [id]);
        const deletedUser = selectResult.rows[0];

        // Excluir o Adm
        const deleteQuery = 'DELETE FROM adm WHERE id = $1';
        await client.query(deleteQuery, [id]);

        console.log('Usuário excluído com sucesso.');
        
        client.release();

        // Retorna o Adm excluído como JSON
        return JSON.stringify(deletedUser);
    } catch (error) {
        console.error('Erro ao excluir o usuário:', error);
        throw error;
    }
};

// Função para atualizar um Adm na tabela "adm"
const updateAdm = async (usuario, email, senha) => {
    try {
      // Obtém uma conexão do pool
      const client = await pool.connect();
  
      // Executa a consulta para atualizar o usuário
      const queryResult = await client.query(
        'UPDATE adm SET USUARIO = $1, EMAIL = $2, SENHA = $3 RETURNING *',
        [usuario, email, senha]
      );
  
      // Obtém o Adm atualizado
      const updatedUser = queryResult.rows[0];
  
      // Exibe o Adm atualizado
      console.log('Usuário atualizado:');
      console.log(updatedUser);
  
      // Libera a conexão de volta para o pool
      client.release();
    } catch (error) {
      console.error('Erro ao atualizar o usuário:', error);
    }
  };

/////////////

// Função para buscar todos os depoimentos da tabela "depoimentos"
const getDepoiments = async () => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Executa a consulta para buscar todos os depoimentos
    const queryResult = await client.query('SELECT * FROM depoimentos');

    // Obtém os depoimentos encontrados
    const depoiments = queryResult.rows;

    // Libera a conexão de volta para o pool
    client.release();

    // Retorna os depoimentos como um JSON     
    return JSON.stringify(depoiments);
  } catch (error) {
    console.error('Erro ao buscar os usuários da tabela "DEPOIMENTOS":', error);
    return null; // Em caso de erro, pode retornar null ou um valor adequado
  }
};

const createDepoiments = async (nome, texto) => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Gera um novo ID hexadecimal
    const id = generateHexId(60);

    // Executa a consulta para inserir um novo depoimento com o ID gerado
    const queryResult = await client.query(
      'INSERT INTO depoimentos (ID, NOME, TEXTO) VALUES ($1, $2, $3) RETURNING *',
      [id, nome, texto]
    );

    // Obtém o depoimento criado
    const newDepoiment = queryResult.rows[0];

    client.release();

    // Retorna o novo depoimento como JSON
    return JSON.stringify(newDepoiment);
  } catch (error) {
    console.error('Erro ao criar um novo depoimento:', error);
    throw error; // Lança o erro para que seja tratado externamente, se necessário
  }
};


const deleteDepoiments = async (id) => {
  try {
      const client = await pool.connect();

      // Obter o depoimento a ser excluído antes de removê-lo
      const selectQuery = 'SELECT * FROM depoimentos WHERE id = $1';
      const selectResult = await client.query(selectQuery, [id]);
      const deletedDepoiment = selectResult.rows[0];

      // Excluir o Adm
      const deleteQuery = 'DELETE FROM depoimentos WHERE id = $1';
      await client.query(deleteQuery, [id]);

      console.log('Depoimento excluído com sucesso.');
      
      client.release();

      // Retorna o depoimento excluído como JSON
      return JSON.stringify(deletedDepoiment); 
  } catch (error) {
      console.error('Erro ao excluir o Depoimento:', error);
      throw error;
  }
};

// Função para atualizar um Depoimento na tabela "depoimentos"
const updateDepoiments = async (nome, texto) => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Executa a consulta para atualizar o Depoimento
    const queryResult = await client.query(
      'UPDATE depoimentos SET NOME = $1, TEXTO = $2 RETURNING *',
      [nome, texto]
    );

    // Obtém o Depoimento atualizado
    const updatedDepoiment = queryResult.rows[0];

    // Exibe o Depoimento atualizado
    console.log('Usuário atualizado:');
    console.log(updatedDepoiment);

    // Libera a conexão de volta para o pool
    client.release();
  } catch (error) {
    console.error('Erro ao atualizar o usuário:', error);
  }
};


module.exports = {
    getAdms,
    createAdm,
    deleteAdm,
    updateAdm,
    getDepoiments,
    createDepoiments,
    deleteDepoiments,
    updateDepoiments,
};