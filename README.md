  <h1>Jogo multiplayer em JavaScript</h1>
    <p>Este projeto é um jogo multiplayer desenvolvido em JavaScript, com servidor feito em ExpressJS e Socket.io. A lógica do jogo foi desenvolvida completamente em JavaScript, e o frontend utiliza HTML, CSS e JavaScript para exibir informações do estado do jogo.</p>
  <h2>Como funciona o jogo?</h2>
<p>Ao entrar no jogo, o jogador encontra um QRCode no centro da tela. Ao escanear o QRCode com o celular, é aberta uma nova aba no navegador do celular com um display de controle com uma cor aleatória. Enquanto isso, na tela do jogo, onde estava o QRCode, aparece um pixel da mesma cor do controle do jogador.</p>

<p>Vários jogadores podem entrar no jogo com o mesmo QRCode. Quando todos os jogadores estiverem prontos, eles podem clicar no botão "Pronto" na tela do controle para iniciar o jogo.</p>

<p>Quando o jogo começa, pixels amarelos e roxos começam a aparecer na tela. Os amarelos são frutinhas que, quando comidas, dão um ponto ao jogador. Já os roxos fazem o jogador perder metade de seu nível.</p>

<p>Cada jogador começa no nível 1. Para subir de nível, é necessário comer um número específico de frutinhas: 2 para subir para o nível 2, 3 para subir para o nível 3, e assim por diante.</p>

<p>Os jogadores podem comer outros jogadores menores para ganhar seus pontos.</p>

<h2>Como executar o projeto</h2>
<ol>
  <li>Clone o repositório do projeto.</li>
  <li>Instale as dependências com `npm install`.</li>
  <li>Execute o servidor com `npm start`.</li>
  <li>Acesse `http://localhost:3000` em seu navegador para jogar.</li>
</ol>

<h2>Dependências</h2>
<ul>
  <li>ExpressJS</li>
  <li>Socket.io</li>
</ul>

<h2>Autores</h2>
<p>Este jogo foi desenvolvido por Higor Correa Feijó.</p>
