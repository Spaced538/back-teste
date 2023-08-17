const express =  require('express')
const app = express() 
const { getAdms,createAdm,deleteAdm,updateAdm,getDepoiments,createDepoiments,
        deleteDepoiments,updateDepoiments, } = require('./controllers/adms');
const { Login,verificarToken } = require('./controllers/controler_login');

app.use(express.json());

const port = 8000

app.get('/', (req, res) => {
  res.send('Bem-vindo à página inicial');
});


app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {

    const token = await Login(email, senha); // Chama a função Login para obter o token

    if (token) {
        res.json({ token }); // Retorna o token para o cliente em vez de redirecionar
    } else {
        res.status(401).send('Email ou senha inválido!'); // Retorna erro de autenticação
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/adms',  verificarToken, async (req, res) => {
  try {
    const users = await getAdms();

    if (users) {
      res.json(JSON.parse(users)); // Envia a resposta como JSON para o cliente
    } else {
      res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Configuração da rota para criar um usuário
app.post('/adms/create', verificarToken, async (req, res) => {
  console.log(req.body);
  try {
    // Recupera os dados do corpo da requisição
    const {nome,email, senha} = req.body;
    
    
    // Chama a função createUser para criar um novo usuário
    const newUser = await createAdm(nome,email, senha);

    // Retorna o novo usuário como resposta da requisição
    res.json(newUser);

  } catch (error) {
    console.error('Erro ao criar um novo usuário:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao criar um novo usuário' });
  }
});

// Configuração da rota para excluir um usuário
app.delete('/adms/:id', verificarToken, async (req, res) => {
try {
  const id = req.params.id;

  // Chama a função deleteUser para excluir o usuário
  const dUser = await deleteAdm(id);
  console.log(dUser);

  // Retorna o usuário excluído como resposta da requisição
  res.json(dUser);

} catch (error) {
  console.error('Erro ao excluir o usuário:', error);
  // Retorna uma resposta de erro com status 500
  res.status(500).json({ error: 'Erro ao excluir o usuário' });
}
});


// Configuração da rota para atualizar um usuário
app.put('/adms/:id', verificarToken, async (req, res) => {
try {
  const id = req.params.id;
  const {nome,email, senha} = req.body;

  // Chama a função updateUser para atualizar o usuário
  await updateAdm(nome,email, senha);

  // Retorna uma resposta de sucesso
  res.json({ message: 'Usuário atualizado com sucesso' });

} catch (error) {
  console.error('Erro ao atualizar o usuário:', error);
  // Retorna uma resposta de erro com status 500
  res.status(500).json({ error: 'Erro ao atualizar o usuário' });
}
});

////////////////////////
app.get('/depoiments', verificarToken, async (req, res) => {
    try {
      const users = await getDepoiments();
  
      if (users) {
        res.json(JSON.parse(users)); // Envia a resposta como JSON para o cliente
      } else {
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  });

// Configuração da rota para criar um usuário
app.post('/depoiments/create', verificarToken, async (req, res) => {
  console.log(req.body);
  try {
    // Recupera os dados do corpo da requisição
    const {nome,texto} = req.body;
    
    
    // Chama a função createUser para criar um novo usuário
    const newUser = await createDepoiments(nome,texto);

    // Retorna o novo usuário como resposta da requisição
    res.json(newUser);

  } catch (error) {
    console.error('Erro ao criar um novo usuário:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao criar um novo usuário' });
  }
});

// Configuração da rota para excluir um usuário
app.delete('/depoiments/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    // Chama a função deleteUser para excluir o usuário
    const dUser = await deleteDepoiments(id);
    console.log(dUser);

    // Retorna o usuário excluído como resposta da requisição
    res.json(dUser);

  } catch (error) {
    console.error('Erro ao excluir o usuário:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao excluir o usuário' });
  }
});


// Configuração da rota para atualizar um usuário
app.put('/depoiments/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const {nome,texto} = req.body;

    // Chama a função updateUser para atualizar o usuário
    await updateDepoiments(nome,texto);

    // Retorna uma resposta de sucesso
    res.json({ message: 'Usuário atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar o usuário:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao atualizar o usuário' });
  }
});

 
app.listen(port, () => {
   
    console.log("Servidor inciado na portta", port);
})

