const { pool } = require('../service/conectionDb/service');
const bcrypt = require('bcryptjs');
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
    // Verifica se já existe um adm com o email fornecido
    const existingUser = await pool.query('SELECT * FROM adm WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new Error('Já existe um usuário com esse email.');
    }

    // Gera um novo ID hexadecimal
    const id = generateHexId(60);

    // Criptografa a senha antes de armazená-la no banco de dados
    const hashedSenha = await bcrypt.hash(senha, 10); // O segundo argumento é o número de salt rounds

    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Executa a consulta para inserir um novo adm com o ID gerado
    const queryResult = await client.query(
      'INSERT INTO adm (ID, USUARIO, EMAIL, SENHA) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, usuario, email, hashedSenha]
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
        
        client.release();

        // Retorna o Adm excluído como JSON
        return JSON.stringify(deletedUser);
    } catch (error) {
        console.error('Erro ao excluir o usuário:', error);
        throw error;
    }
};

const updateAdm = async (id, usuario, email, senha) => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Constrói a parte da consulta SQL para atualizar campos específicos
    let updateFields = [];
    let queryParams = [id];

    // Verifica e adiciona o campo USUARIO se for passado
    if (usuario !== undefined) {
      updateFields.push('USUARIO = $2');
      queryParams.push(usuario);
    }

    // Verifica e adiciona o campo EMAIL se for passado
    if (email !== undefined) {
      updateFields.push('EMAIL = $3');
      queryParams.push(email);
    }

    // Verifica e adiciona o campo SENHA se for passado
    if (senha !== undefined) {
      // Criptografa a nova senha usando o bcrypt
      const hashedPassword = await bcrypt.hash(senha, 10);

      updateFields.push('SENHA = $4');
      queryParams.push(hashedPassword);
    }

    // Monta a consulta SQL final
    const updateQuery = `
      UPDATE adm
      SET ${updateFields.join(', ')}
      WHERE ID = $1
      RETURNING *
    `;

    // Executa a consulta para atualizar o usuário
    const queryResult = await client.query(updateQuery, queryParams);

    // Obtém o Adm atualizado
    const updatedUser = queryResult.rows[0];

    // Libera a conexão de volta para o pool
    client.release();
    
    return updatedUser; // Retorna o usuário atualizado
  } catch (error) {
    console.error('Erro ao atualizar o usuário:', error);
  }
};

// Função para buscar as informações de um administrador pelo ID
const getAdmById = async (id) => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Executa a consulta para buscar o administrador pelo ID (todos os campos, exceto a senha)
    const queryResult = await client.query('SELECT id, usuario, email FROM adm WHERE id = $1', [id]);

    // Libera a conexão de volta para o pool
    client.release();

    // Retorna o administrador encontrado como JSON
    return JSON.stringify(queryResult.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar o administrador:', error);
    return null; // Em caso de erro, pode retornar null ou um valor adequado
  }
};

/////////////////////////////////////////

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
      
      client.release();

      // Retorna o depoimento excluído como JSON
      return JSON.stringify(deletedDepoiment); 
  } catch (error) {
      console.error('Erro ao excluir o Depoimento:', error);
      throw error;
  }
};

// Função para atualizar um Depoimento na tabela "depoimentos"
const updateDepoiments = async (id, nome, texto) => {
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

    if (texto !== undefined) {
      if (updateClause !== '') {
        updateClause += ', ';
      }
      updateClause += 'TEXTO = $' + (queryParams.length + 1); // Correção aqui
      queryParams.push(texto);
    }

    // Executa a consulta para atualizar o Depoimento
    const query = 'UPDATE depoimentos SET ' + updateClause + ' WHERE ID = $1 RETURNING *';
    const queryResult = await client.query(query, queryParams);

    // Obtém o Depoimento atualizado
    const updatedDepoiment = queryResult.rows[0];

    // Libera a conexão de volta para o pool
    client.release();

    return updatedDepoiment; // Retorna o depoimento atualizado
  } catch (error) {
    console.error('Erro ao atualizar o depoimento:', error);
    throw error; // Lembre-se de relançar o erro para que ele possa ser tratado fora da função
  }
};


const getDepoimentoById = async (id) => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Executa a consulta para buscar o depoimento pelo ID
    const queryResult = await client.query('SELECT * FROM depoimentos WHERE id = $1', [id]);

    // Libera a conexão de volta para o pool
    client.release();

    if (queryResult.rows.length > 0) {
      // Retorna o depoimento encontrado como um objeto JSON
      return JSON.stringify(queryResult.rows[0]);
    } else {
      return null; // Retorna null se o depoimento não for encontrado
    }
  } catch (error) {
    console.error('Erro ao buscar depoimento pelo ID:', error);
    throw error;
  }
};

/////////////////////////////////////////

// Função para buscar todos os contatos dos clientes da tabela "contato_cliente"
const getContact = async () => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Executa a consulta para buscar todos os contatos
    const queryResult = await client.query('SELECT * FROM contato_clientes');

    // Obtém os contatos encontrados
    const contacts = queryResult.rows;

    // Libera a conexão de volta para o pool
    client.release();

    // Retorna os depoimentos como um JSON     
    return JSON.stringify(contacts);
  } catch (error) {
    console.error('Erro ao buscar os contatos dos clientes da tabela "contato_clientes":', error);
    return null; // Em caso de erro, pode retornar null ou um valor adequado
  }
};

const createContact = async (nome, sobrenome, email, assunto) => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Gera um novo ID hexadecimal
    const id = generateHexId(60);

    // Executa a consulta para inserir um novo contato com o ID gerado
    const queryResult = await client.query(
      'INSERT INTO contato_clientes (ID, NOME, SOBRENOME, EMAIL, ASSUNTO) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, nome, sobrenome, email, assunto]
    );

    // Obtém o contato do cliente criado
    const newContact = queryResult.rows[0];

    client.release();

    // Retorna o novo contato do cliente como JSON
    return JSON.stringify(newContact);
  } catch (error) {
    console.error('Erro ao criar um novo depoimento:', error);
    throw error; // Lança o erro para que seja tratado externamente, se necessário
  }
};

const deleteContact = async (id) => {
  try {
      const client = await pool.connect();

      // Obter o contato do cliente a ser excluído antes de removê-lo
      const selectQuery = 'SELECT * FROM contato_clientes WHERE id = $1';
      const selectResult = await client.query(selectQuery, [id]);
      const deletedContact = selectResult.rows[0];

      // Excluir o Adm
      const deleteQuery = 'DELETE FROM contato_clientes WHERE id = $1';
      await client.query(deleteQuery, [id]);
      
      client.release();

      // Retorna o contato do cliente excluído como JSON
      return JSON.stringify(deletedContact); 
  } catch (error) {
      console.error('Erro ao excluir o Depoimento:', error);
      throw error;
  }
};

const getContactById = async (id) => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Executa a consulta para buscar o contato do cliente pelo ID
    const queryResult = await client.query('SELECT * FROM contato_clientes WHERE id = $1', [id]);

    // Libera a conexão de volta para o pool
    client.release();

    if (queryResult.rows.length > 0) {
      // Retorna o contato do cliente encontrado como um objeto JSON
      return JSON.stringify(queryResult.rows[0]);
    } else {
      return null; // Retorna null se o contato do cliente não for encontrado
    }
  } catch (error) {
    console.error('Erro ao buscar contato do cliente pelo ID:', error);
    throw error;
  }
};





module.exports = {

    getAdms,
    createAdm,
    deleteAdm,
    updateAdm,
    getAdmById,

    getDepoiments,
    createDepoiments,
    deleteDepoiments,
    updateDepoiments,
    getDepoimentoById,

    getContact,
    createContact,
    deleteContact,
    getContactById,

    generateHexId,

};
