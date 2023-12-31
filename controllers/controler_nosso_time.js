const { pool } = require('../service/conectionDb/service');
const { bucket } = require('../service/conectionDb/storage');
const { generateHexId } = require('./controlers_tables');
const { uploadImageToStorage, deleteImageFromStorage } = require('./controler_images');



const createOurTeamEntry = async (texto, imagemBuffer, nomeArquivoImagem) => {
    try {
        const client = await pool.connect();
        const id = generateHexId(60); // Gere o ID usando a função generateHexId
        const newNomeArquivoImagem = `${Date.now()}_${nomeArquivoImagem}`;
        const imageUrl = await uploadImageToStorage(imagemBuffer, newNomeArquivoImagem);

        const query = 'INSERT INTO nosso_time (id, texto, nome_arquivo_imagem, url_imagem) VALUES ($1, $2, $3, $4) RETURNING id';
        const values = [id, texto, newNomeArquivoImagem, imageUrl];
        const result = await client.query(query, values);

        const novoItem = {
            id: result.rows[0].id,
            texto,
            url_imagem: imageUrl
        };

        client.release();

        return novoItem; // Retorne o novo item de nosso_time
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao criar item em nosso_time.');
    }
};

const getAllOurTeamEntries = async () => {
    try {
        const client = await pool.connect();

        const queryResult = await client.query('SELECT * FROM nosso_time');

        const items = queryResult.rows;

        client.release();

        return JSON.stringify(items);
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao listar itens em nosso_time.');
    }
};

const deleteOurTeamEntry = async (id) => {
    try {
        const client = await pool.connect();

        const getNomeArquivoImagemQuery = 'SELECT nome_arquivo_imagem FROM nosso_time WHERE id = $1';
        const getNomeArquivoImagemResult = await client.query(getNomeArquivoImagemQuery, [id]);

        if (getNomeArquivoImagemResult.rows.length === 0) {
            throw new Error('Item em nosso_time não encontrado.');
        }

        const nomeArquivoImagem = getNomeArquivoImagemResult.rows[0].nome_arquivo_imagem;

        // Exclua a imagem do Firebase Storage usando o nome do arquivo
        // await deleteImageFromStorage(nomeArquivoImagem);

        const deleteQuery = 'DELETE FROM nosso_time WHERE id = $1 RETURNING *';
        const result = await client.query(deleteQuery, [id]);

        if (result.rows.length === 0) {
            throw new Error('Item em nosso_time não encontrado.');
        }

        client.release();

        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao excluir item em nosso_time.');
    }
};

const updateOurTeamEntry = async (id, texto, imagemBuffer, imageName) => {
    try {
        const client = await pool.connect();

        const getCurrentDataQuery = 'SELECT * FROM nosso_time WHERE id = $1';
        const getCurrentDataResult = await client.query(getCurrentDataQuery, [id]);

        if (getCurrentDataResult.rows.length === 0) {
            throw new Error('Item em nosso_time não encontrado.');
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
            UPDATE nosso_time
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
        throw new Error('Erro ao atualizar item em nosso_time.');
    }
};

const getOurTeamEntryById = async (id) => {
    try {
        const client = await pool.connect();

        const queryResult = await client.query('SELECT * FROM nosso_time WHERE id = $1', [id]);

        client.release();

        if (queryResult.rows.length > 0) {
            return JSON.stringify(queryResult.rows[0]);
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar item em nosso_time pelo ID:', error);
        throw error;
    }
};

module.exports = {
    createOurTeamEntry,
    getAllOurTeamEntries,
    deleteOurTeamEntry,
    updateOurTeamEntry,
    getOurTeamEntryById
};
