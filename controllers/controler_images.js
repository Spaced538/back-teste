const { pool } = require('../service/conectionDb/service');
const { bucket } = require('../service/conectionDb/storage');
const { generateHexId } = require('./controlers_tables');

async function uploadImageToStorage(buffer, originalname) {
  const imageName = `${Date.now()}_${originalname}`;
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

const createColaborador = async (nome, funcao, imagemBuffer, nameFile) => {
    try {
        const client = await pool.connect();
        const id = generateHexId(60); // Gere o ID usando a função generateHexId
        const imageUrl = await uploadImageToStorage(imagemBuffer, nameFile);
        const newNameFile = `${Date.now()}_${nameFile}`;
    
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
  


module.exports = { 

    uploadImageToStorage,

    createColaborador,
    getAllColaboradores,
    deleteColaborador,
};
