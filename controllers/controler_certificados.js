const { pool } = require('../service/conectionDb/service');
const { bucket } = require('../service/conectionDb/storage');
const { generateHexId } = require('./controlers_tables');
const { uploadImageToStorage, deleteImageFromStorage } = require('./controler_images');


const createCertificado = async (imagemBuffer, nomeArquivo) => {
    try {
        const client = await pool.connect();
        const id = generateHexId(60); // Gere o ID usando a função generateHexId
        const novoNomeArquivo = `${Date.now()}_${nomeArquivo}`;
        const urlImagem = await uploadImageToStorage(imagemBuffer, novoNomeArquivo);

        const query = 'INSERT INTO certificados (id, url_imagem, nome_arquivo_imagem) VALUES ($1, $2, $3) RETURNING id';
        const values = [id, urlImagem, novoNomeArquivo];
        const result = await client.query(query, values);

        const novoCertificado = {
            id: result.rows[0].id,
            url_imagem: urlImagem
        };

        client.release();

        return novoCertificado; // Retorne o novo certificado
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao criar certificado.');
    }
};

const getAllCertificados = async () => {
    try {
        const client = await pool.connect();
        const queryResult = await client.query('SELECT * FROM certificados');
        const certificados = queryResult.rows;
        client.release();
        return JSON.stringify(certificados);
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao listar certificados.');
    }
};

const deleteCertificado = async (id) => {
    try {
        const client = await pool.connect();
        const getNomeArquivoQuery = 'SELECT nome_arquivo_imagem FROM certificados WHERE id = $1';
        const getNomeArquivoResult = await client.query(getNomeArquivoQuery, [id]);

        if (getNomeArquivoResult.rows.length === 0) {
            throw new Error('Certificado não encontrado.');
        }

        const nomeArquivo = getNomeArquivoResult.rows[0].nome_arquivo_imagem;

        await deleteImageFromStorage(nomeArquivo);

        const deleteQuery = 'DELETE FROM certificados WHERE id = $1 RETURNING *';
        const result = await client.query(deleteQuery, [id]);

        if (result.rows.length === 0) {
            throw new Error('Certificado não encontrado.');
        }

        client.release();

        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao excluir certificado.');
    }
};

const updateCertificado = async (id, imagemBuffer, nomeArquivo) => {
    try {
        const client = await pool.connect();

        const checkCertificadoQuery = 'SELECT * FROM certificados WHERE id = $1';
        const checkCertificadoResult = await client.query(checkCertificadoQuery, [id]);

        if (checkCertificadoResult.rows.length === 0) {
            throw new Error('Certificado não encontrado.');
        }

        const certificadoExistente = checkCertificadoResult.rows[0];

        // Verifica se uma nova imagem foi fornecida
        if (imagemBuffer) {
            const nomeArquivoExistente = certificadoExistente.nome_arquivo_imagem;
            await deleteImageFromStorage(nomeArquivoExistente);

            const novoNomeArquivo = `${Date.now()}_${nomeArquivo}`;
            const urlImagem = await uploadImageToStorage(imagemBuffer, novoNomeArquivo);

            const updateQuery = 'UPDATE certificados SET url_imagem = $2, nome_arquivo_imagem = $3 WHERE id = $1 RETURNING *';
            const updateValues = [id, urlImagem, novoNomeArquivo];
            const result = await client.query(updateQuery, updateValues);

            client.release();

            return result.rows[0];
        } else {
            // Se nenhuma imagem fornecida, apenas atualiza os outros campos
            const updateQuery = 'UPDATE certificados SET nome_arquivo_imagem = $2 WHERE id = $1 RETURNING *';
            const updateValues = [id, certificadoExistente.nome_arquivo_imagem];
            const result = await client.query(updateQuery, updateValues);

            client.release();

            return result.rows[0];
        }
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao atualizar certificado.');
    }
};


const getCertificadoById = async (id) => {
    try {
        const client = await pool.connect();
        const queryResult = await client.query('SELECT * FROM certificados WHERE id = $1', [id]);
        client.release();

        if (queryResult.rows.length > 0) {
            return JSON.stringify(queryResult.rows[0]);
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar certificado pelo ID:', error);
        throw error;
    }
};

module.exports = { 

    createCertificado,
    getAllCertificados,
    deleteCertificado,
    updateCertificado,
    getCertificadoById

};
