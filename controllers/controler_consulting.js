const { pool } = require('../service/conectionDb/service');
const { bucket } = require('../service/conectionDb/storage');
const { generateHexId } = require('./controlers_tables');
const { uploadImageToStorage, deleteImageFromStorage } = require('./controler_images');

const createConsulting = async (texto, imagemBuffer, nomeArquivoImagem) => {
    try {
        const client = await pool.connect();
        const id = generateHexId(60); // Gere o ID usando a função generateHexId
        const newNomeArquivoImagem = `${Date.now()}_${nomeArquivoImagem}`;
        const imageUrl = await uploadImageToStorage(imagemBuffer, newNomeArquivoImagem);
    
        const query = 'INSERT INTO consulting (id, texto, nome_arquivo_imagem, url_imagem) VALUES ($1, $2, $3, $4) RETURNING id';
        const values = [id, texto, newNomeArquivoImagem, imageUrl];
        const result = await client.query(query, values);
    
        const novoItem = {
            id: result.rows[0].id,
            texto,
            url_imagem: imageUrl
        };

        client.release();
  
        return novoItem; // Retorne o novo item de consulting
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao criar item de consulting.');
    }
};

const getAllConsultingItems = async () => {
    try {
        const client = await pool.connect();

        const queryResult = await client.query('SELECT * FROM consulting');

        const items = queryResult.rows;

        client.release();

        return JSON.stringify(items);
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao listar itens de consulting.');
    }
};

const deleteConsultingItem = async (id) => {
    try {
        const client = await pool.connect();

        const getNomeArquivoImagemQuery = 'SELECT nome_arquivo_imagem FROM consulting WHERE id = $1';
        const getNomeArquivoImagemResult = await client.query(getNomeArquivoImagemQuery, [id]);

        if (getNomeArquivoImagemResult.rows.length === 0) {
            throw new Error('Item de consulting não encontrado.');
        }

        const nomeArquivoImagem = getNomeArquivoImagemResult.rows[0].nome_arquivo_imagem;

        // Exclua a imagem do Firebase Storage usando o nome do arquivo
        // await deleteImageFromStorage(nomeArquivoImagem);

        const deleteQuery = 'DELETE FROM consulting WHERE id = $1 RETURNING *';
        const result = await client.query(deleteQuery, [id]);

        if (result.rows.length === 0) {
            throw new Error('Item de consulting não encontrado.');
        }

        client.release();

        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao excluir item de consulting.');
    }
};

const updateConsultingItem = async (id, texto, imagemBuffer, imageName) => {
    try {
        const client = await pool.connect();

        const getCurrentDataQuery = 'SELECT * FROM consulting WHERE id = $1';
        const getCurrentDataResult = await client.query(getCurrentDataQuery, [id]);

        if (getCurrentDataResult.rows.length === 0) {
            throw new Error('Item de consulting não encontrado.');
        }

        const currentData = getCurrentDataResult.rows[0];

        let newImageName = currentData.nome_arquivo_imagem;
        let imageUrl = currentData.url_imagem;

        if (imagemBuffer && imageName) {
            await deleteImageFromStorage(currentData.nome_arquivo_imagem);
            newImageName = `${Date.now()}_${imageName}`;
            imageUrl = await uploadImageToStorage(imagemBuffer, newImageName);
        }

        const updateQuery = `
            UPDATE consulting
            SET texto = COALESCE($2, texto),
                url_imagem = COALESCE($3, url_imagem),
                nome_arquivo_imagem = COALESCE($4, nome_arquivo_imagem)
            WHERE id = $1
            RETURNING *
        `;

        const values = [id, texto || null, imageUrl || null, newImageName || null];
        const result = await client.query(updateQuery, values);

        client.release();

        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao atualizar item de bookkeeping.');
    }
};

const getConsultingItemById = async (id) => {
    try {
        const client = await pool.connect();

        const queryResult = await client.query('SELECT * FROM consulting WHERE id = $1', [id]);

        client.release();

        if (queryResult.rows.length > 0) {
            return JSON.stringify(queryResult.rows[0]);
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar item de consulting pelo ID:', error);
        throw error;
    }
};


module.exports = { 

    createConsulting,
    getAllConsultingItems,
    deleteConsultingItem,
    updateConsultingItem,
    getConsultingItemById

};