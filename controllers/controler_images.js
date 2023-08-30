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

async function uploadPDFToStorage(buffer, originalname) {
  const pdfName = `${originalname}`;
  const file = bucket.file(pdfName);
  await file.save(buffer);

  const expirationDate = new Date('2030-12-31T23:59:59Z');
  const pdfUrl = await file.getSignedUrl({
    action: 'read',
    expires: expirationDate.toISOString()
  });

  return pdfUrl[0];
}

// Função para excluir arquivo PDF do Firebase Storage
async function deletePDFFromStorage(pdfFileName) {
  try {
    const pdfFile = bucket.file(pdfFileName);
    const exists = await pdfFile.exists();

    if (exists[0]) {
      await pdfFile.delete();
    }
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao excluir arquivo PDF do Storage.');
  }
}

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

      // Libera a conexão de volta para o pool
      client.release();
  
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

      // Se uma nova imagem foi fornecida, exclua a imagem existente e faça upload da nova
      if (imagemBuffer) {
          const imageFileName = checkColaboradorResult.rows[0].nome_arquivo_imagem;
          await deleteImageFromStorage(imageFileName);

          const newNameFile = `${Date.now()}_${nameFile}`;
          const imageUrl = await uploadImageToStorage(imagemBuffer, newNameFile);

          // Atualizar as informações do colaborador no banco de dados
          const updateQuery = 'UPDATE colaborador SET nome = $2, funcao = $3, nome_arquivo_imagem = $4, url_imagem = $5 WHERE id = $1 RETURNING *';
          const updateValues = [id, nome, funcao, newNameFile, imageUrl];
          const result = await client.query(updateQuery, updateValues);

          // Libera a conexão de volta para o pool
          client.release();

          return result.rows[0];
      } else {
          // Atualizar as informações do colaborador no banco de dados sem alterar a imagem
          const updateQuery = 'UPDATE colaborador SET nome = $2, funcao = $3 WHERE id = $1 RETURNING *';
          const updateValues = [id, nome, funcao];
          const result = await client.query(updateQuery, updateValues);

          // Libera a conexão de volta para o pool
          client.release();

          return result.rows[0];
      }


    } catch (error) {
        console.error(error);
        throw new Error('Erro ao atualizar colaborador.');
    }
};

const getColaboradorById = async (id) => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Executa a consulta para buscar o colaborador pelo ID
    const queryResult = await client.query('SELECT * FROM colaborador WHERE id = $1', [id]);

    // Libera a conexão de volta para o pool
    client.release();

    if (queryResult.rows.length > 0) {
      // Retorna o colaborador encontrado como um objeto JSON
      return JSON.stringify(queryResult.rows[0]);
    } else {
      return null; // Retorna null se o colaborador não for encontrado
    }
  } catch (error) {
    console.error('Erro ao buscar colaborador pelo ID:', error);
    throw error;
  }
};
  
/////////////////////////////

const createServicos = async (nome, preco, imagemBuffer, nameFile) => {
    try {
        const client = await pool.connect();
        const id = generateHexId(60); // Gere o ID usando a função generateHexId
        const newNameFile = `${Date.now()}_${nameFile}`;
        const imageUrl = await uploadImageToStorage(imagemBuffer, newNameFile);
    
        const query = 'INSERT INTO servicos (id, nome, preco, nome_arquivo_imagem, url_imagem) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        const values = [id, nome, preco, newNameFile, imageUrl];
        const result = await client.query(query, values);
    
        const novoServico = {
            id: result.rows[0].id,
            nome,
            preco,
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
      // await deleteImageFromStorage(imageFileName);
  
      // Agora, exclua o registro do colaborador da tabela
      const deleteQuery = 'DELETE FROM servicos WHERE id = $1 RETURNING *';
      const result = await client.query(deleteQuery, [id]);
  
      if (result.rows.length === 0) {
        throw new Error('Serviço não encontrado.');
      }

      // Libera a conexão de volta para o pool
      client.release();
  
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao excluir Serviço.');
    }
};

const updateServicos = async (id, nome, preco, imagemBuffer, nameFile) => {
  try {
      const client = await pool.connect();

      // Verifique se o serviço existe
      const checkServicoQuery = 'SELECT * FROM servicos WHERE id = $1';
      const checkServicoResult = await client.query(checkServicoQuery, [id]);

      if (checkServicoResult.rows.length === 0) {
          throw new Error('Serviço não encontrado.');
      }

      const existingData = checkServicoResult.rows[0]; // Dados existentes do serviço

      let updateQuery = 'UPDATE servicos SET';
      const updateValues = [id];

      // Verifique e adicione os campos a serem atualizados
      if (nome !== undefined) {
          updateQuery += ' nome = $2,';
          updateValues.push(nome);
      }

      if (preco !== undefined) {
          updateQuery += ' preco = $' + (updateValues.length + 1) + ',';
          updateValues.push(preco);
      }

      if (imagemBuffer) {
          const imageFileName = existingData.nome_arquivo_imagem;
          await deleteImageFromStorage(imageFileName);

          const newNameFile = `${Date.now()}_${nameFile}`;
          const imageUrl = await uploadImageToStorage(imagemBuffer, newNameFile);

          updateQuery += ' nome_arquivo_imagem = $' + (updateValues.length + 1) + ',';
          updateQuery += ' url_imagem = $' + (updateValues.length + 2);
          updateValues.push(newNameFile, imageUrl);
      }

      // Remova a última vírgula, se houver, e adicione a cláusula WHERE
      updateQuery = updateQuery.replace(/,$/, '') + ' WHERE id = $1 RETURNING *';

      // Execute a consulta de atualização
      const result = await client.query(updateQuery, updateValues);

      // Libera a conexão de volta para o pool
      client.release();

      return result.rows[0];

  } catch (error) {
      console.error(error);
      throw new Error('Erro ao atualizar serviço.');
  }
};

const getServicoById = async (id) => {
  try {
    // Obtém uma conexão do pool
    const client = await pool.connect();

    // Executa a consulta para buscar o serviço pelo ID
    const queryResult = await client.query('SELECT * FROM servicos WHERE id = $1', [id]);

    // Libera a conexão de volta para o pool
    client.release();

    if (queryResult.rows.length > 0) {
      // Retorna o serviço encontrado como um objeto JSON
      return JSON.stringify(queryResult.rows[0]);
    } else {
      return null; // Retorna null se o serviço não for encontrado
    }
  } catch (error) {
    console.error('Erro ao buscar serviço pelo ID:', error);
    throw error;
  }
};

////////////////////////

const createEbook = async (titulo, descricao, pdfBuffer, pdfName, imagemBuffer, imageName) => {
  try {
    const client = await pool.connect();
    const id = generateHexId(60);
    const newPdfName = `${Date.now()}_${pdfName}`;
    const newImageName = `${Date.now()}_${imageName}`;
    
    const pdfUrl = await uploadPDFToStorage(pdfBuffer, newPdfName);
    const imageUrl = await uploadImageToStorage(imagemBuffer, newImageName);

    const query = 'INSERT INTO Ebooks (id, titulo, descrição, url_pdf, url_imagem, nome_arquivo_pdf, nome_arquivo_imagem) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id';
    const values = [id, titulo, descricao, pdfUrl, imageUrl, newPdfName, newImageName];
    const result = await client.query(query, values);

    const novoEbook = {
      id: result.rows[0].id,
      titulo,
      descricao,
      url_PDF: pdfUrl,
      url_imagem: imageUrl
    };

    client.release();
  
    return novoEbook;
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao criar ebook.');
  }
};

const getAllEbooks = async () => {
  try {
      
      // Obtém uma conexão do pool
      const client = await pool.connect();

      // Executa a consulta para buscar todos os ebooks
      const queryResult = await client.query('SELECT * FROM ebooks');

      // Obtém os ebooks encontrados
      const ebooks = queryResult.rows;

      // Libera a conexão de volta para o pool
      client.release();

      // Retorna os usuários como um JSON     
      return JSON.stringify(ebooks);
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao listar ebooks.');
    }
};

const deleteEbook = async (id) => {
  try {
    const client = await pool.connect();

    const getFilesInfoQuery = 'SELECT nome_arquivo_pdf, nome_arquivo_imagem FROM ebooks WHERE id = $1';
    const getFilesInfoResult = await client.query(getFilesInfoQuery, [id]);

    if (getFilesInfoResult.rows.length === 0) {
      throw new Error('Ebook não encontrado.');
    }

    const pdfFileName = getFilesInfoResult.rows[0].nome_arquivo_pdf;
    const imageFileName = getFilesInfoResult.rows[0].nome_arquivo_imagem;

    await deletePDFFromStorage(pdfFileName);
    await deleteImageFromStorage(imageFileName);

    const deleteQuery = 'DELETE FROM ebooks WHERE id = $1 RETURNING *';
    const result = await client.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      throw new Error('Ebook não encontrado.');
    }

    client.release();

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao excluir ebook.');
  }
};

const updateEbook = async (id, titulo, descricao, pdfBuffer, pdfName, imagemBuffer, imageName) => {
  try {
    const client = await pool.connect();

    const checkEbookQuery = 'SELECT * FROM Ebooks WHERE id = $1';
    const checkEbookResult = await client.query(checkEbookQuery, [id]);

    if (checkEbookResult.rows.length === 0) {
      throw new Error('Ebook não encontrado.');
    }

    const existingEbook = checkEbookResult.rows[0];

    if (pdfBuffer || imagemBuffer) {
      if (pdfBuffer) {
        const pdfFileName = existingEbook.nome_arquivo_pdf;
        await deletePDFFromStorage(pdfFileName);

        const newPdfName = `${Date.now()}_${pdfName}`;
        const pdfUrl = await uploadPDFToStorage(pdfBuffer, newPdfName);
        
        existingEbook.url_PDF = pdfUrl;
        existingEbook.nome_arquivo_pdf = newPdfName;
      }

      if (imagemBuffer) {
        const imageFileName = existingEbook.nome_arquivo_imagem;
        await deleteImageFromStorage(imageFileName);

        const newImageName = `${Date.now()}_${imageName}`;
        const imageUrl = await uploadImageToStorage(imagemBuffer, newImageName);
        
        existingEbook.url_imagem = imageUrl;
        existingEbook.nome_arquivo_imagem = newImageName;
      }

      const updateQuery = 'UPDATE ebooks SET itulo = $2, descrição = $3, url_PDF = $4, nome_arquivo_pdf = $5, url_imagem = $6, nome_arquivo_imagem = $7 WHERE id = $1 RETURNING *';
      const updateValues = [id, titulo, descricao, existingEbook.url_PDF, existingEbook.nome_arquivo_pdf, existingEbook.url_imagem, existingEbook.nome_arquivo_imagem];
      const result = await client.query(updateQuery, updateValues);

      client.release();

      return result.rows[0];
    } else {
      const updateQuery = 'UPDATE Ebooks SET Titulo = $2, descricao = $3 WHERE id = $1 RETURNING *';
      const updateValues = [id, titulo, descricao];
      const result = await client.query(updateQuery, updateValues);

      client.release();

      return result.rows[0];
    }
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao atualizar ebook.');
  }
};

const getEbookById = async (id) => {
  try {
    const client = await pool.connect();

    const queryResult = await client.query('SELECT * FROM ebooks WHERE id = $1', [id]);

    client.release();

    if (queryResult.rows.length > 0) {
      return JSON.stringify(queryResult.rows[0]);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar ebook pelo ID:', error);
    throw error;
  }
};

  
  


module.exports = { 

    uploadImageToStorage,

    createColaborador,
    getAllColaboradores,
    deleteColaborador,
    updateColaborador,
    getColaboradorById,

    createServicos,
    getAllServicos,
    deleteServicos,
    updateServicos,
    getServicoById,

    createEbook,
    getAllEbooks,
    deleteEbook,
    updateEbook,
    getEbookById,

    deleteImageFromStorage
};
