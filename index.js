import cookieParser from 'cookie-parser';
import express from 'express';

const host = '0.0.0.0'; 
const porta = 3000; 

const app = express();
var listaProdutos = [];

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

function estaAutenticado(req, res, next) {
    if (req.session.logado) {
        next();
    } else {
        res.send("Você precisa estar logado! <a href='/login'>Login</a>");
    }
}

app.get('/', (req, res) => {
    res.send(`
       <!DOCTYPE html>
       <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Menu do sistema</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>

            <body>

            <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
            <a class="navbar-brand" href="/">Menu</a>

            <div class="collapse navbar-collapse">
            <ul class="navbar-nav me-auto">

                <li class="nav-item">
                    <a class="nav-link" href="/login">Login</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="/produto">Cadastrar Produtos</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="/listaProdutos">Listar Produtos</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="/logout">Logout</a>
                </li>

            </ul>
        </div>
    </div>
</nav>

            <div class="container mt-4">
                <h2>Bem-vindo ao sistema</h2>
            </div>

            </body>
       </html>
    `);
});

app.get('/login', (req, res) => {
    res.send(`
    <!DOCTYPE html>

<head>
    <meta charset="utf-8">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</head>

<body>
    <div class="container w-25">
        <form action='/login' method='POST' class="row g-3 needs-validation" novalidate>
            <fieldset class="border p-2">
                <legend class="mb-3">Autenticação do Sistema</legend>
                <div class="col-md-4">
                    <label for="" class="form-label">Usuário:</label>
                    <input type="text" class="form-control" id="usuario" name="usuario" required>
                </div>
                <div class="col-md-4">
                    <label for="senha" class="form-label">Senha</label>
                    <input type="password" class="form-control" id="senha" name="senha" required>
                </div>
                <div class="col-12 mt-2">
                    <button class="btn btn-primary" type="submit">Login</button>
                </div>
            </fieldset>
        </form>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
        crossorigin="anonymous"></script>
</body>

</html>
    `);
});

app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === "admin" && senha === "123") {
        req.session.logado = true;
        req.session.usuario = usuario;

        const data = new Date();
        res.cookie("ultimoAcesso", data.toLocaleString());

        res.redirect('/');
    } else {
        res.send("Login inválido!");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/produto', estaAutenticado, (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Cadastro de Produto</title>

        <!-- BOOTSTRAP -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body>

    <div class="container mt-4">
        <h2 class="mb-4">Cadastro de Produto</h2>

        <form method="POST" action="/produto">

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Código</label>
                    <input name="codigo" class="form-control" required>
                </div>

                <div class="col-md-6 mb-3">
                    <label class="form-label">Descrição</label>
                    <input name="descricao" class="form-control" required>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Preço Custo</label>
                    <input name="precoCusto" class="form-control" required>
                </div>

                <div class="col-md-6 mb-3">
                    <label class="form-label">Preço Venda</label>
                    <input name="precoVenda" class="form-control" required>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Validade</label>
                    <input type="date" name="validade" class="form-control" required>
                </div>

                <div class="col-md-6 mb-3">
                    <label class="form-label">Estoque</label>
                    <input name="estoque" class="form-control" required>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label">Fabricante</label>
                <input name="fabricante" class="form-control" required>
            </div>

            <button type="submit" class="btn btn-primary">Cadastrar</button>
            <a href="/listaProdutos" class="btn btn-secondary">Voltar</a>

        </form>
    </div>

    </body>
    </html>
    `);
});

app.post('/produto', estaAutenticado, (req, res) => {
    const produto = req.body;

    listaProdutos.push(produto);

    res.redirect('/listaProdutos');
});

app.get('/listaProdutos', estaAutenticado, (req, res) => {

    const ultimoAcesso = req.cookies.ultimoAcesso;

    let html = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Lista de Produtos</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body>

    <div class="container mt-4">
        <h2>Lista de Produtos</h2>
        <p><strong>Último acesso:</strong> ${ultimoAcesso || "Primeiro acesso"}</p>

        <table class="table table-striped table-hover">
            <thead class="table-dark">
                <tr>
                    <th>#</th>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Custo</th>
                    <th>Venda</th>
                    <th>Validade</th>
                    <th>Estoque</th>
                    <th>Fabricante</th>
                </tr>
            </thead>
            <tbody>
    `;

    listaProdutos.forEach((p, i) => {
        html += `
            <tr>
                <th>${i + 1}</th>
                <td>${p.codigo}</td>
                <td>${p.descricao}</td>
                <td>${p.precoCusto}</td>
                <td>${p.precoVenda}</td>
                <td>${p.validade}</td>
                <td>${p.estoque}</td>
                <td>${p.fabricante}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>

        <a href="/produto" class="btn btn-primary">Novo Produto</a>
    </div>

    </body>
    </html>
    `;

    res.send(html);
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});