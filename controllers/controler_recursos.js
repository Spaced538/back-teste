const { pool } = require('../service/conectionDb/service');
const { bucket } = require('../service/conectionDb/storage');
const { generateHexId } = require('./controlers_tables');
const { uploadImageToStorage, deleteImageFromStorage } = require('./controler_images');

const createRecurso = async (titulo, descricao, imagemBuffer, nomeArquivoImagem) => {
    try {
        const client = await pool.connect();
        const id = generateHexId(60);
        const newNomeArquivoImagem = `${Date.now()}_${nomeArquivoImagem}`;
        const imageUrl = await uploadImageToStorage(imagemBuffer, newNomeArquivoImagem);

        const query = 'INSERT INTO recursos (id, titulo, descricao, nome_arquivo_imagem, url_imagem) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        const values = [id, titulo, descricao, newNomeArquivoImagem, imageUrl];
        const result = await client.query(query, values);

        const novoItem = {
            id: result.rows[0].id,
            titulo,
            descricao,
            url_imagem: imageUrl
        };

        client.release();

        return novoItem;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao criar item de recurso.');
    }
};

const getAllRecursos = async () => {
    try {
        const client = await pool.connect();

        const queryResult = await client.query('SELECT * FROM recursos');

        const items = queryResult.rows;

        client.release();

        return JSON.stringify(items);
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao listar itens de recurso.');
    }
};

const deleteRecurso = async (id) => {
    try {
        const client = await pool.connect();

        const getNomeArquivoImagemQuery = 'SELECT nome_arquivo_imagem FROM recursos WHERE id = $1';
        const getNomeArquivoImagemResult = await client.query(getNomeArquivoImagemQuery, [id]);

        if (getNomeArquivoImagemResult.rows.length === 0) {
            throw new Error('Item de recurso não encontrado.');
        }

        const nomeArquivoImagem = getNomeArquivoImagemResult.rows[0].nome_arquivo_imagem;

        // Exclua a imagem do Firebase Storage usando o nome do arquivo
        // await deleteImageFromStorage(nomeArquivoImagem);

        const deleteQuery = 'DELETE FROM recursos WHERE id = $1 RETURNING *';
        const result = await client.query(deleteQuery, [id]);

        if (result.rows.length === 0) {
            throw new Error('Item de recurso não encontrado.');
        }

        client.release();

        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao excluir item de recurso.');
    }
};

const updateRecurso = async (id, titulo, descricao, imagemBuffer, imageName) => {
    try {
        const client = await pool.connect();

        const getCurrentDataQuery = 'SELECT * FROM recursos WHERE id = $1';
        const getCurrentDataResult = await client.query(getCurrentDataQuery, [id]);

        if (getCurrentDataResult.rows.length === 0) {
            throw new Error('Item de recurso não encontrado.');
        }

        const currentData = getCurrentDataResult.rows[0];

        let newImageName = currentData.nome_arquivo_imagem;
        let imageUrl = currentData.url_imagem;

        if (imagemBuffer && imageName) {
            // await deleteImageFromStorage(currentData.nome_arquivo_imagem);
            newImageName = `${Date.now()}_${imageName}`;
            imageUrl = await uploadImageToStorage(imagemBuffer, newImageName);
        }

        const updateQuery = `
            UPDATE recursos
            SET titulo = COALESCE($2, titulo),
                descricao = COALESCE($3, descricao),
                url_imagem = COALESCE($4, url_imagem),
                nome_arquivo_imagem = COALESCE($5, nome_arquivo_imagem)
            WHERE id = $1
            RETURNING *
        `;

        const values = [id, titulo || null, descricao || null, imageUrl || null, newImageName || null];
        const result = await client.query(updateQuery, values);

        client.release();

        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao atualizar item de recurso.');
    }
};

const getRecursoById = async (id) => {
    try {
        const client = await pool.connect();

        const queryResult = await client.query('SELECT * FROM recursos WHERE id = $1', [id]);

        client.release();

        if (queryResult.rows.length > 0) {
            return JSON.stringify(queryResult.rows[0]);
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar item de recurso pelo ID:', error);
        throw error;
    }
};

module.exports = { 
    createRecurso,
    getAllRecursos,
    deleteRecurso,
    updateRecurso,
    getRecursoById
};
