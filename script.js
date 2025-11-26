// ----- Elementos do DOM -----
const boardElement       = document.getElementById('board');
const messageElement     = document.getElementById('message');
const resetBtn           = document.getElementById('resetBtn');
const resetRankingBtn    = document.getElementById('resetRankingBtn');
const winsXElement       = document.getElementById('winsX');
const winsOElement       = document.getElementById('winsO');

// ----- Estado do jogo -----
let board         = [['', '', ''], ['', '', ''], ['', '', '']];
let currentPlayer = 'X';
let gameActive    = true;
let winner        = null;

// Carrega ranking
let winsX = parseInt(localStorage.getItem('winsX')) || 0;
let winsO = parseInt(localStorage.getItem('winsO')) || 0;

// ----- UI helpers -----
function updateWinsDisplay() {
  winsXElement.textContent = winsX;
  winsOElement.textContent = winsO;
}

function saveWins() {
  localStorage.setItem('winsX', winsX);
  localStorage.setItem('winsO', winsO);
}

function updateMessage() {
  if (!gameActive) return;
  messageElement.textContent = `Vez do jogador ${currentPlayer}`;
  messageElement.className = 'message turn';
}

// ----- Renderização do tabuleiro -----
function renderBoard() {
  boardElement.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.setAttribute('role', 'button');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute(
        'aria-label',
        `Linha ${i + 1} coluna ${j + 1}, ${board[i][j] || 'vazio'}`
      );
      cell.textContent = board[i][j];
      if (board[i][j] === 'X') cell.classList.add('x-mark');
      if (board[i][j] === 'O') cell.classList.add('o-mark');

      cell.addEventListener('click', () => handleCellClick(i, j));
      cell.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCellClick(i, j);
        }
      });

      boardElement.appendChild(cell);
    }
  }
}

// ----- Lógica de clique -----
function handleCellClick(row, col) {
  if (!gameActive || board[row][col] !== '') return;

  // Marca a jogada
  board[row][col] = currentPlayer;

  checkWinner();
  if (gameActive && isBoardFull()) {
    messageElement.textContent = 'Empate!';
    messageElement.className   = 'message draw';
    gameActive                = false;
  }

  if (gameActive) {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateMessage();
  }

  renderBoard();
}

// ----- Verifica vitória -----
function checkWinner() {
  const lines = [
    [board[0][0], board[0][1], board[0][2]],
    [board[1][0], board[1][1], board[1][2]],
    [board[2][0], board[2][1], board[2][2]],
    [board[0][0], board[1][0], board[2][0]],
    [board[0][1], board[1][1], board[2][1]],
    [board[0][2], board[1][2], board[2][2]],
    [board[0][0], board[1][1], board[2][2]],
    [board[0][2], board[1][1], board[2][0]]
  ];

  for (const line of lines) {
    if (line[0] && line[0] === line[1] && line[1] === line[2]) {
      winner = line[0];
      messageElement.textContent = `Jogador ${winner} ganhou!`;
      messageElement.className   = 'message winner';
      gameActive                = false;

      if (winner === 'X') winsX++;
      else                winsO++;
      saveWins();
      updateWinsDisplay();
      return;
    }
  }
}

// ----- Verifica empate -----
function isBoardFull() {
  return board.flat().every(cell => cell !== '');
}

// ----- Reset e eventos -----
function resetGame() {
  board         = [['', '', ''], ['', '', ''], ['', '', '']];
  currentPlayer = 'X';
  gameActive    = true;
  winner        = null;
  updateMessage();
  renderBoard();
}

function resetRanking() {
  if (confirm('Tem certeza que deseja resetar o ranking de vitórias?')) {
    winsX = 0;
    winsO = 0;
    saveWins();
    updateWinsDisplay();
  }
}

resetBtn.addEventListener('click', resetGame);
resetRankingBtn.addEventListener('click', resetRanking);

// ----- Inicialização -----
updateWinsDisplay();
updateMessage();
renderBoard();
