const express =  require('express')
const app = express() 
const { getUsers,createUser,deleteUser,updateUser } = require('./controllers/teste');

app.use(express.json());

const port = 8000

app.get('/', async (req, res) => {
    try {
      const users = await getUsers();
  
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
app.post('/create', async (req, res) => {
  console.log(req.body);
  try {
    // Recupera os dados do corpo da requisição
    const { nome, email, idade, data_c } = req.body;
    
    
    // Chama a função createUser para criar um novo usuário
    const newUser = await createUser(nome, email, idade, data_c);

    // Retorna o novo usuário como resposta da requisição
    res.json(newUser);

  } catch (error) {
    console.error('Erro ao criar um novo usuário:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao criar um novo usuário' });
  }
});

// Configuração da rota para excluir um usuário
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Chama a função deleteUser para excluir o usuário
    const dUser = await deleteUser(id);
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
app.put('/usuarios/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {nome, email, idade, data_c } = req.body;

    // Chama a função updateUser para atualizar o usuário
    await updateUser(id, nome, email, idade, data_c);

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

