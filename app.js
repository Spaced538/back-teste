const express = require('express')
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { getAdms,createAdm,deleteAdm,updateAdm,getAdmById,
        getDepoiments,createDepoiments,deleteDepoiments,updateDepoiments,getDepoimentoById,
        getContact,createContact,deleteContact,getContactById, } = require('./controllers/controlers_tables');
const { Login,verificarToken } = require('./controllers/controler_login');
const { createColaborador,getAllColaboradores,deleteColaborador,updateColaborador,getColaboradorById,
        createServicos,getAllServicos,deleteServicos,updateServicos,getServicoById,
        createEbook,getAllEbooks,deleteEbook,updateEbook,getEbookById, 
        deleteImageFromStorage,deletePDFFromStorage } = require('./controllers/controler_images');
const { createBlogPost,getAllBlogPosts,deleteBlogPost,updateBlogPost,getBlogPostById} = require('./controllers/controler_blog');
const { createBookkeeping,getAllBookkeepingItems,deleteBookkeepingItem,updateBookkeepingItem,getBookkeepingItemById } = require('./controllers/controler_bookkeeping');
const { createConsultoria,getConsultoria,deleteConsultoria,updateConsultoria,getConsultoriaById } = require('./controllers/controler_consultoria');
const { createCertificado,getAllCertificados,deleteCertificado,updateCertificado,getCertificadoById} = require('./controllers/controler_certificados');
const { createConsulting,getAllConsultingItems,deleteConsultingItem,updateConsultingItem,getConsultingItemById} = require('./controllers/controler_consulting');
const { getComentarios,createComentario,deleteComentario,updateComentario,getComentarioById, getAllComentarios} = require('./controllers/controler_comentarios');
const { createAgendamentos,getAgendamentos,deleteAgendamentos,updateAgendamentos,getAgendamentoById} = require('./controllers/controler_agendamentos');
const { createOurTeamEntry,getAllOurTeamEntries,deleteOurTeamEntry,updateOurTeamEntry,getOurTeamEntryById} = require('./controllers/controler_nosso_time');
const { getQuemSomos,createQuemSomos,deleteQuemSomos,updateQuemSomos,getQuemSomosById} = require('./controllers/controler_quem_somos');
const { createValor,getValor,deleteValor,updateValor,getValorById} = require('./controllers/controler_valor');
const { getConfiguracoes,createConfiguracao,deleteConfiguracao,updateConfiguracao,getConfiguracaoById} = require('./controllers/controler_configuracao');
const { getVisibilidade,updateVisibilidadeAtivo,getVisibilidadeById,createVisibilidade,deleteVisibilidadeById} = require('./controllers/controler_visibilidade');
const { createCliente,getClientes,deleteCliente,updateCliente,getClienteById} = require('./controllers/controler_email_clientes');
const { createRecurso,getAllRecursos,deleteRecurso,updateRecurso,getRecursoById} = require('./controllers/controler_recursos');
const app = express() 
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configuração do transporte de email
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com', // Substitua com o host do seu servidor SMTP
  port: 587, // Substitua com a porta do seu servidor SMTP
  secure: false, // Se for true, use 465 em vez de 587
  auth: {
    user: 'seu_email@example.com', // Substitua com seu endereço de email
    pass: 'sua_senha_de_email', // Substitua com sua senha de email
  },
});

const port = 8000

app.get('/', (req, res) => {
  res.status(200).send('success');
});


app.post('/login', async (req, res) => {

  const { email, senha } = req.body;

  try {

    const token = await Login(email, senha); // Chama a função Login para obter o token

    if (token) {
      res.json({ token }); // Retorna o token para o cliente em vez de redirecionar
    }
    else {
      res.status(401).send('Email ou senha inválido!'); // Retorna erro de autenticação
    }
  }
  catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/adms', verificarToken, async (req, res) => {
  try {

    const users = await getAdms();

    if (users) {
      res.json(JSON.parse(users)); // Envia a resposta como JSON para o cliente
    }

    else {
      res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
  }
  catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Configuração da rota para criar um usuário
app.post('/adms/create', verificarToken, async (req, res) => {

  try {

    // Recupera os dados do corpo da requisição
    const { usuario, email, senha } = req.body;

    // Chama a função createUser para criar um novo usuário
    const newUser = await createAdm(usuario, email, senha);

    // Retorna o novo usuário como resposta da requisição
    res.json(newUser);

  }
  catch (error) {
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
  catch (error) {
    console.error('Erro ao excluir o usuário:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao excluir o usuário' });
  }
});

// Configuração da rota para atualizar um usuário
app.put('/adms/:id', verificarToken, async (req, res) => {

  try {

    const id = req.params.id;
    const { usuario, email, senha } = req.body;

    // Chama a função updateUser para atualizar o usuário
    await updateAdm(id, usuario, email, senha);

    // Retorna uma resposta de sucesso
    res.json({ message: 'Usuário atualizado com sucesso' });

  }
  catch (error) {
    console.error('Erro ao atualizar o usuário:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao atualizar o usuário' });
  }
});

// Configuração da rota para buscar as informações de um administrador pelo ID
app.get('/adms/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    // Chama a função getAdmById para buscar as informações do administrador pelo ID
    const admInfo = await getAdmById(id);

    if (admInfo) {
      res.json(JSON.parse(admInfo)); // Envia as informações do administrador como resposta
    } else {
      res.status(404).json({ error: 'Administrador não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao buscar as informações do administrador:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

////////////////////////

app.get('/depoiments', async (req, res) => {

  try {

    const users = await getDepoiments();

    if (users) {
      res.json(JSON.parse(users)); // Envia a resposta como JSON para o cliente
    }
    else {
      res.status(500).json({ error: 'Erro ao buscar depoimentos.' });
    }
  }
  catch (error) {
    console.error('Erro ao buscar depoimentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Configuração da rota para criar um depoimento
app.post('/depoiments/create', verificarToken, async (req, res) => {

  try {
    // Recupera os dados do corpo da requisição
    const { nome, texto } = req.body;

    // Chama a função createDepoiment para criar um novo depoimento
    const newDepoiment = await createDepoiments(nome, texto);

    // Retorna o novo depoimento como resposta da requisição
    res.json(newDepoiment);

  }
  catch (error) {
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
  catch (error) {
    console.error('Erro ao excluir o depoimento:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao excluir o depoimento' });
  }
});


// Configuração da rota para atualizar um depoimento
app.put('/depoiments/:id', verificarToken, async (req, res) => {

  try {

    const id = req.params.id;
    const { nome, texto } = req.body;

    // Chama a função updateDepoiment para atualizar o depoimento
    await updateDepoiments(id, nome, texto);

    // Retorna uma resposta de sucesso
    res.json({ message: 'Depoimento atualizado com sucesso' });

  }
  catch (error) {
    console.error('Erro ao atualizar o depoimento:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao atualizar o depoimento' });
  }
});

// Configuração da rota para obter um depoimento pelo ID
app.get('/depoimentos/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Chama a função getDepoimentoById para obter o depoimento pelo ID
    const depoimento = await getDepoimentoById(id);

    if (depoimento) {
      res.json(JSON.parse(depoimento)); // Retorna o depoimento encontrado como resposta
    } else {
      res.status(404).json({ error: 'Depoimento não encontrado.' }); // Retorna erro 404 se o depoimento não for encontrado
    }
  } catch (error) {
    console.error('Erro ao buscar depoimento pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

////////////////////////

app.get('/contacts', verificarToken, async (req, res) => {

  try {

    const contacts = await getContact();

    if (contacts) {
      res.json(JSON.parse(contacts)); // Envia a resposta como JSON para o cliente
    }
    else {
      res.status(500).json({ error: 'Erro ao buscar os contatos.' });
    }
  }
  catch (error) {
    console.error('Erro ao buscar os contatos:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.post('/contacts/create', async (req, res) => {

  try {
    // Recupera os dados do corpo da requisição
    const { nome, sobrenome, email, assunto } = req.body;

    // Chama a função createContact para criar um novo contato do cliente
    const newContact = await createContact(nome, sobrenome, email, assunto);

    // Retorna o novo contato do cliente como resposta da requisição
    res.json(JSON.parse(newContact));

  }
  catch (error) {
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
    res.json(JSON.parse(dContact));

  }
  catch (error) {
    console.error('Erro ao excluir o contato:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao excluir o contato' });
  }
});

// Configuração da rota para obter um contato do cliente pelo ID
app.get('/contacts/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Chama a função getContactById para obter o contato do cliente pelo ID
    const contato = await getContactById(id);

    if (contato) {
      res.json(JSON.parse(contato)); // Retorna o contato do cliente encontrado como resposta
    } else {
      res.status(404).json({ error: 'Contato do cliente não encontrado.' }); // Retorna erro 404 se o contato do cliente não for encontrado
    }
  } catch (error) {
    console.error('Erro ao buscar contato do cliente pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

////////////////////////

app.post('/colaboradores/create', verificarToken, upload.single('imagem'), async (req, res) => {
  try {
    const { nome, funcao } = req.body;
    const imagemBuffer = req.file.buffer;

    const nameFile = req.file.originalname;

    // Chama a função createColaborador para criar um novo Colaborador
    const newColaborador = await createColaborador(nome, funcao, imagemBuffer, nameFile);

    // Retorna o novo Colaborador como resposta da requisição
    res.json(newColaborador);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar colaborador.' });
  }
});

app.get('/colaboradores', async (req, res) => {

  try {

    const colaboradores = await getAllColaboradores();

    if (colaboradores) {
      res.json(JSON.parse(colaboradores)); // Envia a resposta como JSON para o cliente
    }
    else {
      res.status(500).json({ error: 'Erro ao buscar os contatos.' });
    }
  }
  catch (error) {
    console.error('Erro ao buscar os contatos:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Configuração da rota para excluir um colaborador
app.delete('/colaboradores/:id', verificarToken, async (req, res) => {

  try {

    const id = req.params.id;

    // Chama a função deleteContact para excluir o colaborador
    const dContact = await deleteColaborador(id);

    // Retorna o colaborador excluído como resposta da requisição
    res.json(dContact);

  }
  catch (error) {
    console.error('Erro ao excluir o colaborador:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao excluir o colaborador' });
  }
});

// Configuração da rota para atualizar um colaborador
app.put('/colaboradores/:id', verificarToken, upload.single('imagem'), async (req, res) => {

  try {
    const id = req.params.id;

    const { nome, funcao } = req.body;
    const imagemBuffer = req.file ? req.file.buffer : undefined;
    const nameFile = req.file ? req.file.originalname : undefined;

    // Chama a função updateColaborador para atualizar um novo Colaborador
    const upColaborador = await updateColaborador(id, nome, funcao, imagemBuffer, nameFile);

    // Retorna o novo Colaborador como resposta da requisição
    res.json(upColaborador);
  }
  catch (error) {
    console.error('Erro ao atualizar o contato:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao atualizar o contato' });
  }
});

// Configuração da rota para obter um colaborador pelo ID
app.get('/colaboradores/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    // Chama a função getColaboradorById para obter o colaborador pelo ID
    const colaborador = await getColaboradorById(id);

    if (colaborador) {
      res.json(JSON.parse(colaborador)); // Retorna o colaborador encontrado como resposta
    } else {
      res.status(404).json({ error: 'Colaborador não encontrado.' }); // Retorna erro 404 se o colaborador não for encontrado
    }
  } catch (error) {
    console.error('Erro ao buscar colaborador pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

////////////////////////

app.post('/servicos/create', verificarToken, upload.single('imagem'), async (req, res) => {
  try {
    const { nome, preco } = req.body;
    const imagemBuffer = req.file.buffer;

    const nameFile = req.file.originalname;

    // Chama a função createServicos para criar um novo serviço
    const newServico = await createServicos(nome, preco, imagemBuffer, nameFile);

    // Retorna o novo serviços como resposta da requisição
    res.json(newServico);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar Serviço.' });
  }
});

app.get('/servicos', async (req, res) => {

  try {

    const servicos = await getAllServicos();

    if (servicos) {
      res.json(JSON.parse(servicos)); // Envia a resposta como JSON para o cliente
    }
    else {
      res.status(500).json({ error: 'Erro ao buscar os Serviços.' });
    }
  }
  catch (error) {
    console.error('Erro ao buscar os contatos:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Configuração da rota para excluir um serviço
app.delete('/servicos/:id', verificarToken, async (req, res) => {

  try {

    const id = req.params.id;

    // Chama a função deleteServicos para excluir o serviço
    const dServico = await deleteServicos(id);

    // Retorna o serviço excluído como resposta da requisição
    res.json(dServico);
    await deleteImageFromStorage(dServico.nome_arquivo_imagem);

  }
  catch (error) {
    console.error('Erro ao excluir o serviço:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao excluir o serviço' });
  }
});

// Configuração da rota para atualizar um colaborador
app.put('/servicos/:id', verificarToken, upload.single('imagem'), async (req, res) => {

  try {
    const id = req.params.id;

    const { nome, preco } = req.body;
    const imagemBuffer = req.file ? req.file.buffer : undefined;
    const nameFile = req.file ? req.file.originalname : undefined;

    // Chama a função updateColaborador para atualizar um novo Colaborador
    const updateServico = await updateServicos(id, nome, preco, imagemBuffer, nameFile);

    // Retorna o novo Colaborador como resposta da requisição
    res.json(updateServico);
  }
  catch (error) {
    console.error('Erro ao atualizar o serviço:', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao atualizar o serviço' });
  }
});


// Configuração da rota para obter um serviço pelo ID
app.get('/servicos/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    // Chama a função getServicoById para obter o serviço pelo ID
    const servico = await getServicoById(id);

    if (servico) {
      res.json(JSON.parse(servico)); // Retorna o serviço encontrado como resposta
    } else {
      res.status(404).json({ error: 'Serviço não encontrado.' }); // Retorna erro 404 se o serviço não for encontrado
    }
  } catch (error) {
    console.error('Erro ao buscar serviço pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

/////////////////////////////////

app.post('/ebooks/create', verificarToken, upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'imagem', maxCount: 1 }]), async (req, res) => {
  try {
    const id = req.params.id;
    const { titulo, descricao } = req.body;
    let pdfBuffer, pdfName, imagemBuffer, imageName;

    if (req.files['pdf'] && req.files['pdf'][0]) {
      pdfBuffer = req.files['pdf'][0].buffer;
      pdfName = req.files['pdf'][0].originalname;
    }

    if (req.files['imagem'] && req.files['imagem'][0]) {
      imagemBuffer = req.files['imagem'][0].buffer;
      imageName = req.files['imagem'][0].originalname;
    }

    const novoEbook = await createEbook(titulo, descricao, pdfBuffer, pdfName, imagemBuffer, imageName);

    res.json(novoEbook);
  } catch (error) {
    console.error('Erro ao criar um novo ebook:', error);
    res.status(500).json({ error: 'Erro ao criar um novo ebook' });
  }
});

app.get('/ebooks', async (req, res) => {
  try {
    const ebooks = await getAllEbooks();

    res.json(JSON.parse(ebooks));
  } catch (error) {
    console.error('Erro ao listar ebooks:', error);
    res.status(500).json({ error: 'Erro ao listar ebooks' });
  }
});

app.delete('/ebooks/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const deletedEbook = await deleteEbook(id);

    res.json(deletedEbook);

    await deletePDFFromStorage(deletedEbook.nome_arquivo_pdf);
    await deleteImageFromStorage(deletedEbook.nome_arquivo_imagem);
  } catch (error) {
    console.error('Erro ao excluir ebook:', error);
    res.status(500).json({ error: 'Erro ao excluir ebook' });
  }
});


app.put('/ebooks/:id', verificarToken, upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'imagem', maxCount: 1 }]), async (req, res) => {
  try {
    const id = req.params.id;

    const { titulo, descricao } = req.body;
    const pdfBuffer = req.files['pdf'] ? req.files['pdf'][0].buffer : undefined;
    const pdfName = req.files['pdf'] ? req.files['pdf'][0].originalname : undefined;
    const imagemBuffer = req.files['imagem'] ? req.files['imagem'][0].buffer : undefined;
    const imageName = req.files['imagem'] ? req.files['imagem'][0].originalname : undefined;

    // Chama a função updateEbook para atualizar um novo Ebook
    const upEbook = await updateEbook(id, titulo, descricao, pdfBuffer, pdfName, imagemBuffer, imageName);

    res.json(upEbook);
  } catch (error) {
    console.error('Erro ao atualizar ebook:', error);
    res.status(500).json({ error: 'Erro ao atualizar ebook' });
  }
});

app.get('/ebooks/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    const ebook = await getEbookById(id);

    if (ebook) {
      res.json(JSON.parse(ebook));
    } else {
      res.status(404).json({ error: 'Ebook não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao buscar ebook pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

////////////////////////////////////

app.post('/blog/create', verificarToken, upload.fields([{ name: 'imagem', maxCount: 1 }]), async (req, res) => {
  try {
    const { titulo, texto } = req.body;
    let imagemBuffer, imageName;

    if (req.files['imagem'] && req.files['imagem'][0]) {
      imagemBuffer = req.files['imagem'][0].buffer;
      imageName = req.files['imagem'][0].originalname;
    }

    const newBlogPost = await createBlogPost(titulo, texto, imagemBuffer, imageName);

    res.json(newBlogPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar post no blog.' });
  }
});

// Rota para listar todos os posts do blog
app.get('/blog', async (req, res) => {
  try {
    const blogPosts = await getAllBlogPosts();

    if (blogPosts) {
      res.json(JSON.parse(blogPosts));
    } else {
      res.status(500).json({ error: 'Erro ao buscar os posts do blog.' });
    }
  } catch (error) {
    console.error('Erro ao buscar os posts do blog:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota para excluir um post do blog
app.delete('/blog/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const deletedBlogPost = await deleteBlogPost(id);

    if (deletedBlogPost.nome_arquivo_imagem) {
      await deleteImageFromStorage(deletedBlogPost.nome_arquivo_imagem);
    }

    res.json(deletedBlogPost);
  } catch (error) {
    console.error('Erro ao excluir o post do blog:', error);
    res.status(500).json({ error: 'Erro ao excluir o post do blog.' });
  }
});

// Rota para atualizar um post do blog
app.put('/blog/:id', verificarToken, upload.fields([{ name: 'imagem', maxCount: 1 }]), async (req, res) => {
  try {
    const id = req.params.id;

    const { titulo, texto } = req.body;

    const imagemBuffer = req.files['imagem'] ? req.files['imagem'][0].buffer : undefined;
    const imageName = req.files['imagem'] ? req.files['imagem'][0].originalname : undefined;



    const updatedBlogPost = await updateBlogPost(id, titulo, texto, imagemBuffer, imageName);

    res.json(updatedBlogPost);
  } catch (error) {
    console.error('Erro ao atualizar o post do blog:', error);
    res.status(500).json({ error: 'Erro ao atualizar o post do blog.' });
  }
});

// Rota para obter um post do blog pelo ID
app.get('/blog/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const blogPost = await getBlogPostById(id);

    if (blogPost) {
      res.json(JSON.parse(blogPost));
    } else {
      res.status(404).json({ error: 'Post do blog não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao buscar post do blog pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

///////////////////////////////////

app.post('/bookkeeping/create', verificarToken, upload.single('imagem'), async (req, res) => {
  try {
    const { texto } = req.body;
    const imagemBuffer = req.file.buffer;
    const nomeArquivoImagem = req.file.originalname;

    const newEntry = await createBookkeeping(texto, imagemBuffer, nomeArquivoImagem);

    res.json(newEntry);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar entrada em bookkeeping.' });
  }
});

app.get('/bookkeeping', async (req, res) => {
  try {
    const entries = await getAllBookkeepingItems();

    if (entries) {
      res.json(JSON.parse(entries));
    } else {
      res.status(500).json({ error: 'Erro ao buscar entradas em bookkeeping.' });
    }
  } catch (error) {
    console.error('Erro ao buscar entradas em bookkeeping:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.delete('/bookkeeping/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    const deletedEntry = await deleteBookkeepingItem(id);

    res.json(deletedEntry);
    await deleteImageFromStorage(deletedEntry.nome_arquivo_imagem);

  } catch (error) {
    console.error('Erro ao excluir entrada em bookkeeping:', error);
    res.status(500).json({ error: 'Erro ao excluir entrada em bookkeeping' });
  }
});

app.put('/bookkeeping/:id', verificarToken, upload.fields([{ name: 'imagem', maxCount: 1 }]), async (req, res) => {
  try {
    const id = req.params.id;

    const { texto } = req.body;

    const imagemBuffer = req.files['imagem'] ? req.files['imagem'][0].buffer : undefined;
    const imageName = req.files['imagem'] ? req.files['imagem'][0].originalname : undefined;

    const updatedEntry = await updateBookkeepingItem(id, texto, imagemBuffer, imageName);


    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar bookkeping.' });
  }
});

app.get('/bookkeeping/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    const entry = await getBookkeepingItemById(id);

    if (entry) {
      res.json(JSON.parse(entry));
    } else {
      res.status(404).json({ error: 'Entrada em bookkeeping não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao buscar entrada em bookkeeping pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

/////////////////////////////////////////////

app.get('/consultoria', async (req, res) => {
  try {
    const consultorias = await getConsultoria();

    if (consultorias) {
      res.json(JSON.parse(consultorias));
    } else {
      res.status(500).json({ error: 'Erro ao buscar consultorias.' });
    }
  } catch (error) {
    console.error('Erro ao buscar consultorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.post('/consultoria/create', verificarToken, async (req, res) => {
  try {
    const { texto1, texto2, texto3, texto4 } = req.body;
    const newConsultoria = await createConsultoria(texto1, texto2, texto3, texto4);
    res.json(JSON.parse(newConsultoria));
  } catch (error) {
    console.error('Erro ao criar uma nova consultoria:', error);
    res.status(500).json({ error: 'Erro ao criar uma nova consultoria.' });
  }
});

app.delete('/consultoria/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const deletedConsultoria = await deleteConsultoria(id);
    res.json(deletedConsultoria);
  } catch (error) {
    console.error('Erro ao excluir a consultoria:', error);
    res.status(500).json({ error: 'Erro ao excluir a consultoria.' });
  }
});

app.put('/consultoria/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { texto1, texto2, texto3, texto4 } = req.body;
    await updateConsultoria(id, texto1, texto2, texto3, texto4);
    res.json({ message: 'Consultoria atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar a consultoria:', error);
    res.status(500).json({ error: 'Erro ao atualizar a consultoria.' });
  }
});

app.get('/consultoria/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const consultoria = await getConsultoriaById(id);

    if (consultoria) {
      res.json(JSON.parse(consultoria));
    } else {
      res.status(404).json({ error: 'Consultoria não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao buscar consultoria pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

//////////////////////////

app.post('/certificados/create', verificarToken, upload.single('imagem'), async (req, res) => {
  try {
    const imagemBuffer = req.file.buffer;
    const nomeArquivo = req.file.originalname;

    const newCertificado = await createCertificado(imagemBuffer, nomeArquivo);

    res.json(newCertificado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar certificado.' });
  }
});

app.get('/certificados', async (req, res) => {
  try {
    const certificados = await getAllCertificados();

    if (certificados) {
      res.json(JSON.parse(certificados));
    } else {
      res.status(500).json({ error: 'Erro ao buscar os certificados.' });
    }
  } catch (error) {
    console.error('Erro ao buscar os certificados:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.delete('/certificados/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const deletedCertificado = await deleteCertificado(id);
    res.json(deletedCertificado);
  } catch (error) {
    console.error('Erro ao excluir o certificado:', error);
    res.status(500).json({ error: 'Erro ao excluir o certificado.' });
  }
});

app.put('/certificados/:id', verificarToken, upload.fields([{ name: 'imagem', maxCount: 1 }]), async (req, res) => {
  try {
    const id = req.params.id;


    const imagemBuffer = req.files['imagem'] ? req.files['imagem'][0].buffer : undefined;
    const imageName = req.files['imagem'] ? req.files['imagem'][0].originalname : undefined;

    const updatedCertificado = await updateCertificado(id, imagemBuffer, imageName);

    res.json(updatedCertificado);
  } catch (error) {
    console.error('Erro ao atualizar o certificado:', error);
    res.status(500).json({ error: 'Erro ao atualizar o certificado.' });
  }
});

app.get('/certificados/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const certificado = await getCertificadoById(id);

    if (certificado) {
      res.json(JSON.parse(certificado));
    } else {
      res.status(404).json({ error: 'Certificado não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao buscar certificado pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

/////////////////////////////////////////

app.post('/consulting/create', verificarToken, upload.single('imagem'), async (req, res) => {
  try {
    const { texto } = req.body;
    const imagemBuffer = req.file.buffer;
    const nomeArquivoImagem = req.file.originalname;

    const newEntry = await createConsulting(texto, imagemBuffer, nomeArquivoImagem);

    res.json(newEntry);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar entrada em consulting.' });
  }
});

app.get('/consulting', async (req, res) => {
  try {
    const entries = await getAllConsultingItems();

    if (entries) {
      res.json(JSON.parse(entries));
    } else {
      res.status(500).json({ error: 'Erro ao buscar entradas em consulting.' });
    }
  } catch (error) {
    console.error('Erro ao buscar entradas em consulting:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.delete('/consulting/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    const deletedEntry = await deleteConsultingItem(id);

    res.json(deletedEntry);
    await deleteImageFromStorage(deletedEntry.nome_arquivo_imagem);

  } catch (error) {
    console.error('Erro ao excluir entrada em consulting:', error);
    res.status(500).json({ error: 'Erro ao excluir entrada em consulting' });
  }
});

app.put('/consulting/:id', verificarToken, upload.fields([{ name: 'imagem', maxCount: 1 }]), async (req, res) => {
  try {
    const id = req.params.id;

    const { texto } = req.body;

    const imagemBuffer = req.files['imagem'] ? req.files['imagem'][0].buffer : undefined;
    const imageName = req.files['imagem'] ? req.files['imagem'][0].originalname : undefined;

    const updatedEntry = await updateConsultingItem(id, texto, imagemBuffer, imageName);


    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar bookkeping.' });
  }
});

app.get('/consulting/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    const entry = await getConsultingItemById(id);

    if (entry) {
      res.json(JSON.parse(entry));
    } else {
      res.status(404).json({ error: 'Entrada em consulting não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao buscar entrada em consulting pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

//////////////////////////////////

app.get('/comentarios/:idPost', async (req, res) => {
  try {
    const idPost = req.params.idPost;

    // Chama a função getComentarios para obter os comentários relacionados ao ID_POST
    const comentarios = await getComentarios(idPost);

    res.json(comentarios);
  } catch (error) {
    console.error('Erro ao buscar comentários pelo ID_POST:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.post('/comentarios/create', async (req, res) => {
  try {
    // Recupera os dados do corpo da requisição
    const { texto } = req.body;
    const { id } = req.body;

    // Chama a função createComentario para criar um novo comentário associado ao ID_POST
    const newComentario = await createComentario(id, texto);

    // Retorna o novo comentário como resposta da requisição
    res.json(newComentario);
  } catch (error) {
    console.error('Erro ao criar um novo comentário:', error);
    res.status(500).json({ error: 'Erro ao criar um novo comentário.' });
  }
});

app.delete('/comentarios/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    // Chama a função deleteComentario para excluir o comentário
    const deletedComentario = await deleteComentario(id);

    // Retorna o comentário excluído como resposta da requisição
    res.json(deletedComentario);
  } catch (error) {
    console.error('Erro ao excluir o comentário:', error);
    res.status(500).json({ error: 'Erro ao excluir o comentário.' });
  }
});

app.put('/comentarios/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { texto } = req.body;

    // Chama a função updateComentario para atualizar o comentário
    await updateComentario(id, texto);

    // Retorna uma resposta de sucesso
    res.json({ message: 'Comentário atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar o comentário:', error);
    res.status(500).json({ error: 'Erro ao atualizar o comentário.' });
  }
});

app.get('/comentarios/id/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);

    // Chama a função getComentarioById para obter o comentário pelo ID
    const comentario = await getComentarioById(id);

    if (comentario) {
      res.json(JSON.parse(comentario));
    } else {
      res.status(404).json({ error: 'Comentário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao buscar comentário pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});
app.get('/comentarios', verificarToken, async (req, res) => {
  try {
  
    // Chama a função getComentarioById para obter o comentário pelo ID
    const comentario = await getAllComentarios();
    if (comentario) {
      res.json(JSON.parse(comentario));
    } else {
      res.status(404).json({ error: 'Comentário não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

////////////////////////////////////////

app.get('/agendamentos', async (req, res) => {
  try {
    const agendamentos = await getAgendamentos();
    if (agendamentos) {
      res.json(JSON.parse(agendamentos));
    } else {
      res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
    }
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.post('/agendamentos/create', async (req, res) => {
  try {
    const { nome, email, telefone, provincia, servico, mais_informacao } = req.body;
    const newAgendamento = await createAgendamentos(nome, email, telefone, provincia, servico, mais_informacao);
    res.json(JSON.parse(newAgendamento));
  } catch (error) {
    console.error('Erro ao criar um novo agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar um novo agendamento.' });
  }
});

app.delete('/agendamentos/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const deletedAgendamento = await deleteAgendamentos(id);
    res.json(JSON.parse(deletedAgendamento));
  } catch (error) {
    console.error('Erro ao excluir o agendamento:', error);
    res.status(500).json({ error: 'Erro ao excluir o agendamento.' });
  }
});

app.put('/agendamentos/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { nome, email, telefone, provincia, servico, mais_informacao } = req.body;
    await updateAgendamentos(id, nome, email, telefone, provincia, servico, mais_informacao);
    res.json({ message: 'Agendamento atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar o agendamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar o agendamento.' });
  }
});

app.get('/agendamentos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const agendamento = await getAgendamentoById(id);
    if (agendamento) {
      res.json(JSON.parse(agendamento));
    } else {
      res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao buscar agendamento pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

///////////////////////////////////////////////

app.post('/our_team/create', verificarToken, upload.single('imagem'), async (req, res) => {
  try {
    const { texto } = req.body;
    const imagemBuffer = req.file.buffer;
    const nomeArquivoImagem = req.file.originalname;

    const newEntry = await createOurTeamEntry(texto, imagemBuffer, nomeArquivoImagem);

    res.json(newEntry);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar entrada em nosso_time.' });
  }
});

app.get('/our_team', async (req, res) => {
  try {
    const entries = await getAllOurTeamEntries();

    if (entries) {
      res.json(JSON.parse(entries));
    } else {
      res.status(500).json({ error: 'Erro ao buscar entradas em nosso_time.' });
    }
  } catch (error) {
    console.error('Erro ao buscar entradas em nosso_time:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.delete('/our_team/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    const deletedEntry = await deleteOurTeamEntry(id);

    res.json(deletedEntry);
    await deleteImageFromStorage(deletedEntry.nome_arquivo_imagem);

  } catch (error) {
    console.error('Erro ao excluir entrada em nosso_time:', error);
    res.status(500).json({ error: 'Erro ao excluir entrada em nosso_time' });
  }
});

app.put('/our_team/:id', verificarToken, upload.fields([{ name: 'imagem', maxCount: 1 }]), async (req, res) => {
  try {
    const id = req.params.id;

    const { texto } = req.body;

    const imagemBuffer = req.files['imagem'] ? req.files['imagem'][0].buffer : undefined;
    const imageName = req.files['imagem'] ? req.files['imagem'][0].originalname : undefined;

    const updatedEntry = await updateOurTeamEntry(id, texto, imagemBuffer, imageName);

    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar nosso_time.' });
  }
});

app.get('/our_team/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    const entry = await getOurTeamEntryById(id);

    if (entry) {
      res.json(JSON.parse(entry));
    } else {
      res.status(404).json({ error: 'Entrada em nosso_time não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao buscar entrada em nosso_time pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

/////////////////////////////////////

// Rota para buscar todas as informações de "quem_somos"
app.get('/quem_somos', async (req, res) => {
  try {
    const infos = await getQuemSomos();

    if (infos) {
      res.json(JSON.parse(infos)); // Envia a resposta como JSON para o cliente
    } else {
      res.status(500).json({ error: 'Erro ao buscar informações de "quem_somos".' });
    }
  } catch (error) {
    console.error('Erro ao buscar informações de "quem_somos":', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota para criar uma nova informação em "quem_somos"
app.post('/quem_somos/create', verificarToken, async (req, res) => {
  try {
    // Recupera os dados do corpo da requisição
    const { texto } = req.body;

    // Chama a função createQuemSomos para criar uma nova informação em "quem_somos"
    const newInfo = await createQuemSomos(texto);

    // Retorna a nova informação como resposta da requisição
    res.json(newInfo);
  } catch (error) {
    console.error('Erro ao criar uma nova informação em "quem_somos":', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao criar uma nova informação em "quem_somos".' });
  }
});

// Rota para excluir uma informação em "quem_somos" pelo ID
app.delete('/quem_somos/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    // Chama a função deleteQuemSomos para excluir a informação em "quem_somos" pelo ID
    const deletedInfo = await deleteQuemSomos(id);

    // Retorna a informação excluída como resposta da requisição
    res.json(deletedInfo);
  } catch (error) {
    console.error('Erro ao excluir a informação em "quem_somos":', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao excluir a informação em "quem_somos".' });
  }
});

// Rota para atualizar uma informação em "quem_somos" pelo ID
app.put('/quem_somos/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { texto } = req.body;

    // Chama a função updateQuemSomos para atualizar a informação em "quem_somos" pelo ID
    await updateQuemSomos(id, texto);

    // Retorna uma resposta de sucesso
    res.json({ message: 'Informação em "quem_somos" atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar a informação em "quem_somos":', error);
    // Retorna uma resposta de erro com status 500
    res.status(500).json({ error: 'Erro ao atualizar a informação em "quem_somos".' });
  }
});

// Rota para obter uma informação em "quem_somos" pelo ID
app.get('/quem_somos/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Chama a função getQuemSomosById para obter a informação em "quem_somos" pelo ID
    const info = await getQuemSomosById(id);

    if (info) {
      res.json(JSON.parse(info)); // Retorna a informação encontrada como resposta
    } else {
      res.status(404).json({ error: 'Informação em "quem_somos" não encontrada.' }); // Retorna erro 404 se a informação não for encontrada
    }
  } catch (error) {
    console.error('Erro ao buscar informação em "quem_somos" pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

///////////////////////////////

// Rota para buscar todos os valores
app.get('/valor', async (req, res) => {
  try {
    const valores = await getValor();

    if (valores) {
      res.json(JSON.parse(valores));
    } else {
      res.status(500).json({ error: 'Erro ao buscar valores.' });
    }
  } catch (error) {
    console.error('Erro ao buscar valores:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota para criar um novo valor
app.post('/valor/create', verificarToken, async (req, res) => {
  try {
    const { texto } = req.body;

    const novoValor = await createValor(texto);

    res.json(novoValor);
  } catch (error) {
    console.error('Erro ao criar um novo valor:', error);
    res.status(500).json({ error: 'Erro ao criar um novo valor.' });
  }
});

// Rota para excluir um valor pelo ID
app.delete('/valor/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    const valorExcluido = await deleteValor(id);

    res.json(valorExcluido);
  } catch (error) {
    console.error('Erro ao excluir valor:', error);
    res.status(500).json({ error: 'Erro ao excluir valor.' });
  }
});

// Rota para atualizar um valor pelo ID
app.put('/valor/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { texto } = req.body;

    await updateValor(id, texto);

    res.json({ message: 'Valor atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar valor:', error);
    res.status(500).json({ error: 'Erro ao atualizar valor.' });
  }
});

// Rota para buscar um valor pelo ID
app.get('/valor/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const valor = await getValorById(id);

    if (valor) {
      res.json(JSON.parse(valor));
    } else {
      res.status(404).json({ error: 'Valor não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao buscar valor pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

///////////////////////////////////////////

app.get('/configuracoes', async (req, res) => {
  try {
    const configuracoes = await getConfiguracoes();
    if (configuracoes) {
      res.json(JSON.parse(configuracoes));
    } else {
      res.status(500).json({ error: 'Erro ao buscar configurações.' });
    }
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.post('/configuracoes/create', async (req, res) => {
  try {
    const {email, senha } = req.body;
    const newConfiguracao = await createConfiguracao(email, senha);
    res.json(JSON.parse(newConfiguracao));
  } catch (error) {
    console.error('Erro ao criar uma nova configuração:', error);
    res.status(500).json({ error: 'Erro ao criar uma nova configuração.' });
  }
});


app.delete('/configuracoes/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const deletedConfiguracao = await deleteConfiguracao(id);
    res.json(JSON.parse(deletedConfiguracao));
  } catch (error) {
    console.error('Erro ao excluir a configuração:', error);
    res.status(500).json({ error: 'Erro ao excluir a configuração.' });
  }
});

app.put('/configuracoes/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { email, senha } = req.body;
    await updateConfiguracao(id, email, senha);
    res.json({ message: 'Configuração atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar a configuração:', error);
    res.status(500).json({ error: 'Erro ao atualizar a configuração.' });
  }
});


app.get('/configuracoes/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const configuracao = await getConfiguracaoById(id);
    if (configuracao) {
      res.json(JSON.parse(configuracao));
    } else {
      res.status(404).json({ error: 'Configuração não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao buscar configuração pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

///////////////////////////// Disparo E-MAIL



app.post('/contacts/emails/create', async (req, res) => {
  try {
    const { nome, sobrenome, email, assunto } = req.body;

    const mailOptions = {
      from: 'contato@canadasimplificado.ca',
      to: 'contato@canadasimplificado.ca',
      subject: `Novo Contato: ${nome} ${sobrenome}`,
      text: `Um novo contato foi feito.\n
             Nome: ${nome} ${sobrenome}\n
             E-mail do usuário: ${email}\n
             Assunto: ${assunto}`
    };

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'contato@canadasimplificado.ca',
        pass: 'bwyqqwwrbmfbmqfm'
      },
    });

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Mensagem de contato enviada com sucesso' });
  } catch (error) {
    console.error('Erro ao criar um novo contato:', error);
    res.status(500).json({ error: 'Erro ao criar um novo contato' });
  }
});

////////////////////////////////////////////////


app.post('/visibilidade/create', verificarToken, async (req, res) => {
  try {
    const { nome_secao, ativo } = req.body;
    const newVisibilidade = await createVisibilidade(nome_secao, ativo);
    res.json(JSON.parse(newVisibilidade));
  } catch (error) {
    console.error('Erro ao criar uma nova visibilidade:', error);
    res.status(500).json({ error: 'Erro ao criar uma nova visibilidade.' });
  }
});

app.get('/visibilidade', async (req, res) => {
  try {
    const visibilidades = await getVisibilidade();

    if (visibilidades) {
      res.json(JSON.parse(visibilidades));
    } else {
      res.status(500).json({ error: 'Erro ao buscar visibilidades.' });
    }
  } catch (error) {
    console.error('Erro ao buscar visibilidades:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.put('/visibilidade/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { ativo } = req.body;
    const updatedVisibilidade = await updateVisibilidadeAtivo(id, ativo);

    if (updatedVisibilidade) {
      res.json(JSON.parse(updatedVisibilidade));
    } else {
      res.status(404).json({ error: 'Visibilidade não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao atualizar a visibilidade:', error);
    res.status(500).json({ error: 'Erro ao atualizar a visibilidade.' });
  }
});

app.get('/visibilidade/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const visibilidade = await getVisibilidadeById(id);

    if (visibilidade) {
      res.json(JSON.parse(visibilidade));
    } else {
      res.status(404).json({ error: 'Visibilidade não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao buscar visibilidade pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.delete('/visibilidade/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const deletedVisibilidade = await deleteVisibilidadeById(id);

    if (deletedVisibilidade) {
      res.json(JSON.parse(deletedVisibilidade));
    } else {
      res.status(404).json({ error: 'Visibilidade não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao excluir a visibilidade:', error);
    res.status(500).json({ error: 'Erro ao excluir a visibilidade.' });
  }
});


///////////////////////////////////////////////

// Rota para buscar todos os clientes
app.get('/cliente', verificarToken, async (req, res) => {
  try {
    const clientes = await getClientes();

    if (clientes) {
      res.json(JSON.parse(clientes));
    } else {
      res.status(500).json({ error: 'Erro ao buscar clientes.' });
    }
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota para criar um novo cliente
app.post('/cliente/create', async (req, res) => {
  try {
    const { nome, sobrenome, email } = req.body;
    const newCliente = await createCliente(nome, sobrenome, email);
    res.json(JSON.parse(newCliente));
  } catch (error) {
    console.error('Erro ao criar um novo cliente:', error);
    res.status(500).json({ error: 'Erro ao criar um novo cliente.' });
  }
});

// Rota para excluir um cliente pelo ID
app.delete('/cliente/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const deletedCliente = await deleteCliente(id);
    res.json(JSON.parse(deletedCliente));
  } catch (error) {
    console.error('Erro ao excluir o cliente:', error);
    res.status(500).json({ error: 'Erro ao excluir o cliente.' });
  }
});

// Rota para atualizar um cliente pelo ID
app.put('/cliente/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { nome, sobrenome, email } = req.body;
    await updateCliente(id, nome, sobrenome, email);
    res.json({ message: 'Cliente atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar o cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar o cliente.' });
  }
});

// Rota para buscar um cliente pelo ID
app.get('/cliente/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const cliente = await getClienteById(id);

    if (cliente) {
      res.json(JSON.parse(cliente));
    } else {
      res.status(404).json({ error: 'Cliente não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao buscar cliente pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

///////////////////////////////////////

// Rota para criar um novo recurso
app.post('/recursos/create', verificarToken, upload.single('imagem'), async (req, res) => {
  try {
    const { titulo, descricao } = req.body;
    const imagemBuffer = req.file.buffer;
    const nomeArquivoImagem = req.file.originalname;

    const newRecurso = await createRecurso(titulo, descricao, imagemBuffer, nomeArquivoImagem);

    res.json(newRecurso);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar um novo recurso.' });
  }
});

// Rota para listar todos os recursos
app.get('/recursos', async (req, res) => {
  try {
    const recursos = await getAllRecursos();

    if (recursos) {
      res.json(JSON.parse(recursos));
    } else {
      res.status(500).json({ error: 'Erro ao buscar recursos.' });
    }
  } catch (error) {
    console.error('Erro ao buscar recursos:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota para excluir um recurso com base no ID passado na rota
app.delete('/recursos/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    const deletedRecurso = await deleteRecurso(id);

    res.json(deletedRecurso);
    await deleteImageFromStorage(deletedRecurso.nome_arquivo_imagem);

  } catch (error) {
    console.error('Erro ao excluir um recurso:', error);
    res.status(500).json({ error: 'Erro ao excluir um recurso.' });
  }
});

// Rota para atualizar um recurso
app.put('/recursos/:id', verificarToken, upload.fields([{ name: 'imagem', maxCount: 1 }]), async (req, res) => {
  try {
    const id = req.params.id;
    const { titulo, descricao } = req.body;

    const imagemBuffer = req.files['imagem'] ? req.files['imagem'][0].buffer : undefined;
    const imageName = req.files['imagem'] ? req.files['imagem'][0].originalname : undefined;

    const updatedRecurso = await updateRecurso(id, titulo, descricao, imagemBuffer, imageName);

    res.json(updatedRecurso);

  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar um recurso.' });
  }
});

// Rota para buscar um recurso pelo ID
app.get('/recursos/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    const recurso = await getRecursoById(id);

    if (recurso) {
      res.json(JSON.parse(recurso));
    } else {
      res.status(404).json({ error: 'Recurso não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao buscar um recurso pelo ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});







app.listen(port, () => {

  console.log("Servidor inciado na portta", port);

})

