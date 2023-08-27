const { pool } = require('../service/conectionDb/service');
const { bucket } = require('../service/conectionDb/storage');
const { generateHexId } = require('./controlers_tables');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  keyFilename: 'C:/Users/mateu/Documents/back-teste/back-teste-fe405-firebase-adminsdk-hhle3-8b885b28f1.json',
});

async function uploadImageToStorage(buffer, originalname) {
  const imageName = `${originalname}`;
  const file = bucket.file(imageName);
  await file.save(buffer);

  // Defina a data de expiração para 31 de dezembro de 2030 às 23:59:59 UTC
  const expirationDate = new Date('2030-12-31T23:59:59Z');
  const imageUrl = await file.getSignedUrl({
    action: 'read',
    expires: expirationDate.toISOString() // Formato ISO 8601
  });

  return imageUrl[0];
}

const deleteImageFromStorage = async (imageName) => {
    try {
      const bucketName = 'gs://back-teste-fe405.appspot.com'; 
      const file = storage.bucket(bucketName).file(imageName);
  
      // Verifique se o arquivo existe antes de tentar excluí-lo
      const exists = await file.exists();
      if (exists[0]) {
        await file.delete();
      }
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao excluir imagem do Storage.');
    }
  };

const createColaborador = async (nome, funcao, imagemBuffer, nameFile) => {
    try {
        const client = await pool.connect();
        const id = generateHexId(60); // Gere o ID usando a função generateHexId
        const newNameFile = `${Date.now()}_${nameFile}`;
        const imageUrl = await uploadImageToStorage(imagemBuffer, newNameFile);
    
        const query = 'INSERT INTO colaborador (id, nome, funcao, nome_arquivo_imagem, url_imagem) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        const values = [id, nome, funcao, newNameFile, imageUrl];
        const result = await client.query(query, values);
    
        const novoColaborador = {
            id: result.rows[0].id,
            nome,
            funcao,
            url_imagem: imageUrl
        };

        client.release();
  
      return novoColaborador; // Retorne o novo colaborador
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao criar colaborador.');
    }
  };
  

const getAllColaboradores = async () => {
    try {
        

        // Obtém uma conexão do pool
        const client = await pool.connect();

        // Executa a consulta para buscar todos os adms
        const queryResult = await client.query('SELECT * FROM colaborador');

        // Obtém os usuários encontrados
        const colaboradores = queryResult.rows;

        // Libera a conexão de volta para o pool
        client.release();

        // Retorna os usuários como um JSON     
        return JSON.stringify(colaboradores);
      } catch (error) {
        console.error(error);
        throw new Error('Erro ao listar colaboradores.');
      }
};

const deleteColaborador = async (id) => {
    try {
      const client = await pool.connect();
  
      // Obtenha o nome do arquivo da imagem associada ao colaborador que está sendo excluído
      const getImageFileNameQuery = 'SELECT nome_arquivo_imagem FROM colaborador WHERE id = $1';
      const getImageFileNameResult = await client.query(getImageFileNameQuery, [id]);
  
      if (getImageFileNameResult.rows.length === 0) {
        throw new Error('Colaborador não encontrado.');
      }
  
      const imageFileName = getImageFileNameResult.rows[0].nome_arquivo_imagem;
  
      // Exclua a imagem do Firebase Storage usando o nome do arquivo
      await deleteImageFromStorage(imageFileName);
  
      // Agora, exclua o registro do colaborador da tabela
      const deleteQuery = 'DELETE FROM colaborador WHERE id = $1 RETURNING *';
      const result = await client.query(deleteQuery, [id]);
  
      if (result.rows.length === 0) {
        throw new Error('Colaborador não encontrado.');
      }
  
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao excluir colaborador.');
    }
};

const updateColaborador = async (id, nome, funcao, imagemBuffer, nameFile) => {
    try {
      const client = await pool.connect();
  
      // Verifique se o colaborador existe
      const checkColaboradorQuery = 'SELECT * FROM colaborador WHERE id = $1';
      const checkColaboradorResult = await client.query(checkColaboradorQuery, [id]);
  
      if (checkColaboradorResult.rows.length === 0) {
        throw new Error('Colaborador não encontrado.');
      }
  
      // Exclua a imagem existente do Firebase Storage
      const imageFileName = checkColaboradorResult.rows[0].nome_arquivo_imagem;
      await deleteImageFromStorage(imageFileName);
  
      // Fazer o upload da nova imagem para o Firebase Storage
      const imageUrl = await uploadImageToStorage(imagemBuffer, nameFile);
  
      // Atualizar as informações do colaborador no banco de dados
      const updateQuery = 'UPDATE colaborador SET nome = $2, funcao = $3, url_imagem = $4, nome_arquivo_imagem = $5 WHERE id = $1 RETURNING *';
      const updateValues = [id, nome, funcao, imageUrl, nameFile];
      const result = await client.query(updateQuery, updateValues);
  
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao atualizar colaborador.');
    }
};
  


/////////////////////////////

const createServicos = async (nome, descricao, imagemBuffer, nameFile) => {
    try {
        const client = await pool.connect();
        const id = generateHexId(60); // Gere o ID usando a função generateHexId
        const newNameFile = `${Date.now()}_${nameFile}`;
        const imageUrl = await uploadImageToStorage(imagemBuffer, newNameFile);
    
        const query = 'INSERT INTO servicos (id, nome, descrição, nome_arquivo_imagem, url_imagem) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        const values = [id, nome, descricao, newNameFile, imageUrl];
        const result = await client.query(query, values);
    
        const novoServico = {
            id: result.rows[0].id,
            nome,
            descricao,
            url_imagem: imageUrl
        };

        client.release();
  
      return novoServico; // Retorne o novo colaborador
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao criar Serviço.');
    }
  };
  

const getAllServicos = async () => {
    try {
        
        // Obtém uma conexão do pool
        const client = await pool.connect();

        // Executa a consulta para buscar todos os adms
        const queryResult = await client.query('SELECT * FROM servicos');

        // Obtém os usuários encontrados
        const servicos = queryResult.rows;

        // Libera a conexão de volta para o pool
        client.release();

        // Retorna os usuários como um JSON     
        return JSON.stringify(servicos);
      } catch (error) {
        console.error(error);
        throw new Error('Erro ao listar serviços.');
      }
};

const deleteServicos = async (id) => {
    try {
      const client = await pool.connect();
  
      // Obtenha o nome do arquivo da imagem associada ao colaborador que está sendo excluído
      const getImageFileNameQuery = 'SELECT nome_arquivo_imagem FROM servicos WHERE id = $1';
      const getImageFileNameResult = await client.query(getImageFileNameQuery, [id]);
  
      if (getImageFileNameResult.rows.length === 0) {
        throw new Error('Serviço não encontrado.');
      }
  
      const imageFileName = getImageFileNameResult.rows[0].nome_arquivo_imagem;
  
      // Exclua a imagem do Firebase Storage usando o nome do arquivo
      await deleteImageFromStorage(imageFileName);
  
      // Agora, exclua o registro do colaborador da tabela
      const deleteQuery = 'DELETE FROM servicos WHERE id = $1 RETURNING *';
      const result = await client.query(deleteQuery, [id]);
  
      if (result.rows.length === 0) {
        throw new Error('Serviço não encontrado.');
      }
  
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao excluir Serviço.');
    }
};



  
  


module.exports = { 

    uploadImageToStorage,

    createColaborador,
    getAllColaboradores,
    deleteColaborador,
    updateColaborador,

    createServicos,
    getAllServicos,
    deleteServicos,
};
