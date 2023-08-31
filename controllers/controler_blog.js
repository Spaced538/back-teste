const { pool } = require('../service/conectionDb/service');
const { bucket } = require('../service/conectionDb/storage');
const { generateHexId } = require('./controlers_tables');
const { uploadImageToStorage, deleteImageFromStorage } = require('./controler_images');

const createBlogPost = async (titulo, texto, imagemBuffer, imageName) => {
    try {
        const client = await pool.connect();
        const id = generateHexId(60);
        let newImageName, imageUrl;

        if (imagemBuffer && imageName) {
            newImageName = `${Date.now()}_${imageName}`;
            imageUrl = await uploadImageToStorage(imagemBuffer, newImageName);
        }

        const query = 'INSERT INTO blog (id, titulo, texto, url_imagem, nome_arquivo_imagem) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        const values = [id, titulo, texto, imageUrl, newImageName];
        const result = await client.query(query, values);

        const newBlogPost = {
            id: result.rows[0].id,
            titulo,
            texto,
            url_imagem: imageUrl
        };

        client.release();

        return newBlogPost;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao criar post no blog.');
    }
};

const getAllBlogPosts = async () => {
    try {
        const client = await pool.connect();
        const queryResult = await client.query('SELECT * FROM blog');
        const blogPosts = queryResult.rows;
        client.release();
        return JSON.stringify(blogPosts);
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao listar posts do blog.');
    }
};

const deleteBlogPost = async (id) => {
    try {
        const client = await pool.connect();
        const getFilesInfoQuery = 'SELECT nome_arquivo_imagem FROM blog WHERE id = $1';
        const getFilesInfoResult = await client.query(getFilesInfoQuery, [id]);

        if (getFilesInfoResult.rows.length === 0) {
            throw new Error('Post do blog não encontrado.');
        }

        const deleteQuery = 'DELETE FROM blog WHERE id = $1 RETURNING *';
        const result = await client.query(deleteQuery, [id]);

        if (result.rows.length === 0) {
            throw new Error('Post do blog não encontrado.');
        }

        if (result.rows[0].nome_arquivo_imagem) {
            await deleteImageFromStorage(result.rows[0].nome_arquivo_imagem);
        }

        client.release();

        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao excluir post do blog.');
    }
};

const getBlogPostById = async (id) => {
    try {
        const client = await pool.connect();
        const queryResult = await client.query('SELECT * FROM blog WHERE id = $1', [id]);
        client.release();

        if (queryResult.rows.length > 0) {
            return JSON.stringify(queryResult.rows[0]);
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar post do blog pelo ID:', error);
        throw error;
    }
};

const updateBlogPost = async (id, titulo, texto, imagemBuffer, imageName) => {
    try {
        const client = await pool.connect();
        const getBlogPostQuery = 'SELECT * FROM blog WHERE id = $1';
        const getBlogPostResult = await client.query(getBlogPostQuery, [id]);

        if (getBlogPostResult.rows.length === 0) {
            throw new Error('Post do blog não encontrado.');
        }

        const blogPost = getBlogPostResult.rows[0];
        let newImageName = blogPost.nome_arquivo_imagem;
        let imageUrl = blogPost.url_imagem;

        if (imagemBuffer && imageName) {
            await deleteImageFromStorage(blogPost.nome_arquivo_imagem);
            newImageName = `${Date.now()}_${imageName}`;
            imageUrl = await uploadImageToStorage(imagemBuffer, newImageName);
        }

        const updateQuery = `
            UPDATE blog
            SET titulo = COALESCE($2, titulo),
                texto = COALESCE($3, texto),
                url_imagem = COALESCE($4, url_imagem),
                nome_arquivo_imagem = COALESCE($5, nome_arquivo_imagem)
            WHERE id = $1
            RETURNING *
        `;

        const values = [id, titulo || null, texto || null, imageUrl || null, newImageName || null];
        const result = await client.query(updateQuery, values);

        client.release();

        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao atualizar post do blog.');
    }
};

// Rota para atualizar um post do blog

module.exports = { 

    createBlogPost,
    getAllBlogPosts,
    deleteBlogPost,
    updateBlogPost,
    getBlogPostById

};