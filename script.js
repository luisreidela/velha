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
let placementsX   = [];
let placementsO   = [];
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

  // Limita a 3 peças por jogador, removendo a mais antiga
  let placements = currentPlayer === 'X' ? placementsX : placementsO;
  if (placements.length >= 3) {
    const oldest = placements.shift();
    board[oldest.row][oldest.col] = '';
  }

  // Marca a jogada
  board[row][col] = currentPlayer;
  placements.push({ row, col, timestamp: Date.now() });

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

  // Se for vez da IA (jogador O), chama com delay
  if (gameActive && currentPlayer === 'O') {
    setTimeout(iaPlay, 400);
  }
}

// ----- Verifica vitória real -----
function checkWinner() {
  const lines = [
    // Hor.
    [board[0][0], board[0][1], board[0][2]],
    [board[1][0], board[1][1], board[1][2]],
    [board[2][0], board[2][1], board[2][2]],
    // Ver.
    [board[0][0], board[1][0], board[2][0]],
    [board[0][1], board[1][1], board[2][1]],
    [board[0][2], board[1][2], board[2][2]],
    // Diags.
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

// ----- IA estratégica -----
function iaPlay() {
  if (!gameActive || currentPlayer !== 'O') return;

  // Tenta vencer ou bloquear
  function findBestMove(player) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === '') {
          board[i][j] = player;
          const win = checkSimulatedWin(player);
          board[i][j] = '';
          if (win) return { row: i, col: j };
        }
      }
    }
    return null;
  }

  function checkSimulatedWin(player) {
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
    return lines.some(line => line.filter(c => c === player).length === 3);
  }

  // 1) tentar vencer
  let move = findBestMove('O');
  // 2) bloquear X
  if (!move) move = findBestMove('X');
  // 3) aleatório
  if (!move) {
    const empties = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === '') empties.push({ row: i, col: j });
      }
    }
    move = empties[Math.floor(Math.random() * empties.length)];
  }

  // Executa
  if (move) {
    handleCellClick(move.row, move.col);
  }
}

// ----- Reset e eventos -----
function resetGame() {
  board         = [['', '', ''], ['', '', ''], ['', '', '']];
  currentPlayer = 'X';
  placementsX   = [];
  placementsO   = [];
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
