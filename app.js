const express =  require('express')
const app = express() 
const { getAdms,createAdm,deleteAdm,updateAdm,
        getDepoiments,createDepoiments,deleteDepoiments,updateDepoiments,
        getContact,createContact,deleteContact,updateContact, } = require('./controllers/controlers_tables');
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

    if (token) 
    {
      res.json({ token }); // Retorna o token para o cliente em vez de redirecionar
    } 
    else 
    {
      res.status(401).send('Email ou senha inválido!'); // Retorna erro de autenticação
    }
  } 
  catch (error) 
  {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/adms',  verificarToken, async (req, res) => {
  try {

    const users = await getAdms();

    if (users) 
    {
      res.json(JSON.parse(users)); // Envia a resposta como JSON para o cliente
    } 
    
    else 
    {
      res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
  } 
  catch (error) 
  {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Configuração da rota para criar um usuário
app.post('/adms/create', verificarToken, async (req, res) => {

  try {

    // Recupera os dados do corpo da requisição
    const {usuario,email, senha} = req.body;
    
    // Chama a função createUser para criar um novo usuário
    const newUser = await createAdm(usuario,email,senha);

    // Retorna o novo usuário como resposta da requisição
    res.json(newUser);

  } 
  catch (error) 
  {
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

    // Retorna o usuário excluído como resposta da requisição
    res.json(dUser);

  } 
  catch (error) 
  {
    console.error('Erro ao excluir o usuário:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao excluir o usuário' });
  }
});

// Configuração da rota para atualizar um usuário
app.put('/adms/:id', verificarToken, async (req, res) => {

  try {

    const id = req.params.id;
    const {usuario,email, senha} = req.body;

    // Chama a função updateUser para atualizar o usuário
    await updateAdm(id, usuario, email, senha);

    // Retorna uma resposta de sucesso
    res.json({ message: 'Usuário atualizado com sucesso' });

  } 
  catch (error) 
  {
    console.error('Erro ao atualizar o usuário:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao atualizar o usuário' });
  }
});

////////////////////////

app.get('/depoiments', async (req, res) => {

  try {

    const users = await getDepoiments();

    if (users) 
    {
      res.json(JSON.parse(users)); // Envia a resposta como JSON para o cliente
    } 
    else 
    {
      res.status(500).json({ error: 'Erro ao buscar depoimentos.' });
    }
  } 
  catch (error) 
  {
    console.error('Erro ao buscar depoimentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Configuração da rota para criar um depoimento
app.post('/depoiments/create', verificarToken, async (req, res) => {

  try {
    // Recupera os dados do corpo da requisição
    const {nome,texto} = req.body;
    
    // Chama a função createDepoiment para criar um novo depoimento
    const newDepoiment = await createDepoiments(nome,texto);

    // Retorna o novo depoimento como resposta da requisição
    res.json(newDepoiment);

  } 
  catch (error) 
  {
    console.error('Erro ao criar um novo depoimento:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao criar um novo depoimento' });
  }
});

// Configuração da rota para excluir um depoimento
app.delete('/depoiments/:id', verificarToken, async (req, res) => {

  try {

    const id = req.params.id;

    // Chama a função deleteDepoiment para excluir o depoimento
    const dUser = await deleteDepoiments(id);

    // Retorna o usuário excluído como resposta da requisição
    res.json(dUser);

  } 
  catch (error) 
  {
    console.error('Erro ao excluir o depoimento:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao excluir o depoimento' });
  }
});


// Configuração da rota para atualizar um depoimento
app.put('/depoiments/:id', verificarToken, async (req, res) => {

  try {

    const id = req.params.id;
    const {nome,texto} = req.body;

    // Chama a função updateDepoiment para atualizar o depoimento
    await updateDepoiments(id, nome, texto);

    // Retorna uma resposta de sucesso
    res.json({ message: 'Depoimento atualizado com sucesso' });

  } 
  catch (error) 
  {
    console.error('Erro ao atualizar o depoimento:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao atualizar o depoimento' });
  }
});

////////////////////////

app.get('/contacts', verificarToken, async (req, res) => {

  try {

    const contacts = await getContact();

    if (contacts) 
    {
      res.json(JSON.parse(contacts)); // Envia a resposta como JSON para o cliente
    } 
    else 
    {
      res.status(500).json({ error: 'Erro ao buscar os contatos.' });
    }
  } 
  catch (error) 
  {
    console.error('Erro ao buscar os contatos:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Configuração da rota para criar um contato do cliente
app.post('/contacts/create', async (req, res) => {

  try {
    // Recupera os dados do corpo da requisição
    const {nome,sobrenome,email,assunto} = req.body;
    
    // Chama a função createContact para criar um novo contato do cliente
    const newContact = await createContact(nome,sobrenome,email,assunto);

    // Retorna o novo contato do cliente como resposta da requisição
    res.json(newContact);

  } 
  catch (error) 
  {
    console.error('Erro ao criar um novo contato:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao criar um novo contato' });
  }
});

// Configuração da rota para excluir um contato do cliente
app.delete('/contacts/:id', verificarToken, async (req, res) => {

  try {

    const id = req.params.id;

    // Chama a função deleteContact para excluir o contato do cliente
    const dContact = await deleteContact(id);
    
    // Retorna o contato do cliente excluído como resposta da requisição
    res.json(dContact);

  } 
  catch (error) 
  {
    console.error('Erro ao excluir o contato:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao excluir o contato' });
  }
});


// Configuração da rota para atualizar um contato do cliente
app.put('/contacts/:id', verificarToken, async (req, res) => {

  try {

    const id = req.params.id;
    const {nome,sobrenome,email,assunto} = req.body;

    // Chama a função updateContact para atualizar o contato do cliente
    await updateContact(id, nome, sobrenome, email, assunto);

    // Retorna uma resposta de sucesso
    res.json({ message: 'Contato atualizado com sucesso' });

  } 
  catch (error) 
  {
    console.error('Erro ao atualizar o contato:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao atualizar o contato' });
  }
});

 
app.listen(port, () => {
   
    console.log("Servidor inciado na portta", port);

})

