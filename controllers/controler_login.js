const { pool } = require('../service/conectionDb/service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function getUsuario(email) {
    try {
      const query = 'SELECT * FROM adm WHERE EMAIL = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0]; // Retorna o primeiro usuário encontrado ou undefined se não encontrado
      
    } catch (error) {
      console.error('Error fetching Email:', error);
      throw error;
    }
}

function verificarToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    jwt.verify(token, process.env.JWT_PASS, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido.' });
        }

        req.usuario = decoded; // Armazena os dados do usuário decodificados no objeto de requisição
        next();
    });
}

const Login = async (email, senha) => {
    
    try {

        // Obtém uma conexão do pool
        const client = await pool.connect();

        // Verifica se já existe um usuário com o email fornecido

        const existingUser = await pool.query('SELECT * FROM adm WHERE email = $1', [email]);
        if (!existingUser) 
        {
            throw new Error('Email ou senha invalido!');
        }

        const usuario = await getUsuario(email); // Renomeado 'email' para 'usuario'

        if (usuario && bcrypt.compareSync(senha, usuario.senha)) 
        {
            const token = jwt.sign({ email: usuario.email }, process.env.JWT_PASS, { expiresIn: '1h' });
            return token;
        } 
        else 
        {
          return false; // Credenciais inválidas
        }
    } 
    catch (error) 
    {
      console.error('Erro ao buscar os usuários da tabela "ADM":', error);
      return null; // Em caso de erro, pode retornar null ou um valor adequado
    }
};

module.exports = {

    Login,
    verificarToken
};