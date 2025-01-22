const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('overlay');
    const body = document.querySelector('body');

    const player = {
      x: canvas.width / 2 - 20,
      y: canvas.height - 50,
      width: 40,
      height: 30,
      speed: 5,
      isMovingLeft: false,
      isMovingRight: false,
      draw: function() {
        ctx.fillStyle = 'white';
        ctx.font = '20px monospace';
        ctx.fillText('/\\_/\\', this.x, this.y);
        ctx.fillText('( o.o )', this.x, this.y + 20);
        ctx.fillText('> ^ <', this.x, this.y + 40);
      }
    };

    let invaders = [];
    let currentLevel = 0;
    const levels = [
      { rows: 3, cols: 10, speed: 0.2 },
      { rows: 4, cols: 10, speed: 0.4 },
      { rows: 4, cols: 12, speed: 0.6 },
      { rows: 5, cols: 12, speed: 0.8 },
      { rows: 5, cols: 14, speed: 1 },
      { rows: 6, cols: 14, speed: 1.2 },
      { rows: 6, cols: 16, speed: 1.4 },
      { rows: 7, cols: 16, speed: 1.6 },
      { rows: 7, cols: 18, speed: 1.8 },
      { rows: 8, cols: 18, speed: 2 },
    ];

    const invaderWidth = 30;
    const invaderHeight = 20;
    const invaderPadding = 10;
    const invaderOffsetTop = 30;
    const invaderOffsetLeft = 30;
    let invaderDirection = 1;

    const bullets = [];
    const bulletSpeed = 7;

    let score = 0;
    let gameOver = false;
    let playerName = '';
    let highScore = 0;
    let controls = {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      fire: 'Space',
    };
    let backgroundColor = '#000';

    function showTitleScreen() {
      overlay.innerHTML = `
        <p style="font-size: 14px;">Controls: Left: ${controls.left}, Right: ${controls.right}, Fire: ${controls.fire}</p>
        <h1>Space Invaders Cat</h1>
        <button id="playButton">Play</button>
        <button id="settingsButton">Settings</button>
      `;
      document.getElementById('playButton').addEventListener('click', () => {
        showNameInput();
      });
      document.getElementById('settingsButton').addEventListener('click', () => {
        showSettings();
      });
      overlay.style.display = 'flex';
    }

    function showSettings() {
      overlay.innerHTML = `
        <h1>Settings</h1>
        <h2>Background Color</h2>
        <button id="blackBackground">Black</button>
        <button id="blueBackground">Blue</button>
        <h2>Controls</h2>
        <button id="changeControls">Change Controls</button>
        <button id="backButton">Back</button>
      `;
      document.getElementById('blackBackground').addEventListener('click', () => {
        backgroundColor = '#000';
        body.style.backgroundColor = backgroundColor;
        saveSettings();
      });
      document.getElementById('blueBackground').addEventListener('click', () => {
        backgroundColor = '#00008B';
        body.style.backgroundColor = backgroundColor;
        saveSettings();
      });
      document.getElementById('changeControls').addEventListener('click', () => {
        showControlSettings();
      });
      document.getElementById('backButton').addEventListener('click', () => {
        showTitleScreen();
      });
    }

    function showControlSettings() {
      overlay.innerHTML = `
        <h1>Change Controls</h1>
        <p>Press a key for each action:</p>
        <button id="changeLeft">Change Left</button>
        <button id="changeRight">Change Right</button>
        <button id="changeFire">Change Fire</button>
        <button id="backToSettings">Back</button>
      `;
      document.getElementById('changeLeft').addEventListener('click', () => {
        changeControl('left');
      });
      document.getElementById('changeRight').addEventListener('click', () => {
        changeControl('right');
      });
      document.getElementById('changeFire').addEventListener('click', () => {
        changeControl('fire');
      });
      document.getElementById('backToSettings').addEventListener('click', () => {
        showSettings();
      });
    }

    function changeControl(control) {
      overlay.innerHTML = `<h1>Press a key for ${control}</h1>`;
      document.addEventListener('keydown', function handleKey(e) {
        controls[control] = e.code;
        saveSettings();
        showControlSettings();
        document.removeEventListener('keydown', handleKey);
      });
    }

    function showNameInput() {
      overlay.innerHTML = `
        <h1>Enter Your Name</h1>
        <input type="text" id="playerNameInput" placeholder="Your Name">
        <button id="nameSubmitButton">Submit</button>
      `;
      document.getElementById('nameSubmitButton').addEventListener('click', () => {
        const nameInput = document.getElementById('playerNameInput');
        if (nameInput.value.trim() !== '') {
          playerName = nameInput.value.trim();
          setPlayerName(playerName);
          overlay.style.display = 'none';
          startGame();
          document.dispatchEvent(new Event('playerNameSet'));
        } else {
          alert('Please enter a valid name.');
        }
      });
      overlay.style.display = 'flex';
    }

    function setPlayerName(name) {
      playerName = name;
    }

    function startGame() {
      currentLevel = 0;
      score = 0;
      gameOver = false;
      invaders = [];
      createInvaders();
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    }

    function init() {
      loadHighScore();
      loadSettings();
      body.style.backgroundColor = backgroundColor;
    }

    function createInvaders() {
      const level = levels[currentLevel];
      const invaderRows = level.rows;
      const invaderCols = level.cols;
      const invaderSpeed = level.speed;

      for (let row = 0; row < invaderRows; row++) {
        for (let col = 0; col < invaderCols; col++) {
          invaders.push({
            x: col * (invaderWidth + invaderPadding) + invaderOffsetLeft,
            y: row * (invaderHeight + invaderPadding) + invaderOffsetTop,
            width: invaderWidth,
            height: invaderHeight,
            alive: true,
            speed: invaderSpeed,
          });
        }
      }
    }

    function handleKeyDown(e) {
      if (e.code === controls.left) player.isMovingLeft = true;
      if (e.code === controls.right) player.isMovingRight = true;
      if (e.code === controls.fire) fireBullet();
    }

    function handleKeyUp(e) {
      if (e.code === controls.left) player.isMovingLeft = false;
      if (e.code === controls.right) player.isMovingRight = false;
    }

    function fireBullet() {
      bullets.push({
        x: player.x + player.width / 2,
        y: player.y,
        width: 5,
        height: 10,
      });
    }

    function update() {
      if (gameOver) return;

      // Player movement
      if (player.isMovingLeft && player.x > 0) player.x -= player.speed;
      if (player.isMovingRight && player.x < canvas.width - player.width) player.x += player.speed;

      // Invader movement
      let moveDown = false;
      for (const invader of invaders) {
        if (!invader.alive) continue;
        invader.x += invader.speed * invaderDirection;
        if (invader.x + invader.width > canvas.width || invader.x < 0) {
          moveDown = true;
        }
      }

      if (moveDown) {
        invaderDirection *= -1;
        for (const invader of invaders) {
          if (invader.alive) {
            invader.y += invaderHeight;
          }
        }
      }

      // Bullet movement and collision
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y -= bulletSpeed;

        // Check for collision with invaders
        for (let j = invaders.length - 1; j >= 0; j--) {
          const invader = invaders[j];
          if (invader.alive &&
            bullet.x < invader.x + invader.width &&
            bullet.x + bullet.width > invader.x &&
            bullet.y < invader.y + invader.height &&
            bullet.y + bullet.height > invader.y) {
            invader.alive = false;
            bullets.splice(i, 1);
            score += 10;
            break;
          }
        }

        // Remove bullet if it goes off screen
        if (bullet.y < 0) {
          bullets.splice(i, 1);
        }
      }

      // Check for game over
      for (const invader of invaders) {
        if (invader.alive && invader.y + invader.height > player.y) {
          gameOver = true;
        }
      }

      if (invaders.every(invader => !invader.alive)) {
        currentLevel++;
        if (currentLevel < levels.length) {
          invaders = [];
          createInvaders();
        } else {
          gameOver = true;
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw player
      player.draw();

      // Draw invaders
      for (const invader of invaders) {
        if (invader.alive) {
          ctx.fillStyle = 'green';
          ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
        }
      }

      // Draw bullets
      ctx.fillStyle = 'white';
      for (const bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      }

      // Draw score
      ctx.fillStyle = 'white';
      ctx.font = '16px sans-serif';
      ctx.fillText('Score: ' + score, 10, 20);

      // Draw game over message
      if (gameOver) {
        showGameOverScreen();
      }
    }

    function gameLoop() {
      update();
      draw();
      if (!gameOver) {
        requestAnimationFrame(gameLoop);
      }
    }

    function showGameOverScreen() {
      saveHighScore();
      overlay.innerHTML = `
        <h1>${invaders.every(invader => !invader.alive) && currentLevel === levels.length ? 'You Win!' : 'Game Over'}</h1>
        <h2>Score: ${score}</h2>
        ${highScore > 0 ? `<h2>High Score: ${highScore}</h2>` : ''}
        <button id="playAgainButton">Play Again</button>
      `;
      document.getElementById('playAgainButton').addEventListener('click', () => {
        overlay.style.display = 'none';
        startGame();
        gameLoop();
      });
      overlay.style.display = 'flex';
    }

    function loadHighScore() {
      try {
        const savedScore = localStorage.getItem('highScore');
        if (savedScore) {
          highScore = parseInt(savedScore, 10);
        }
      } catch (e) {
        console.error('Error loading high score:', e);
      }
    }

    function saveHighScore() {
      if (score > highScore) {
        highScore = score;
        try {
          localStorage.setItem('highScore', highScore.toString());
        } catch (e) {
          console.error('Error saving high score:', e);
        }
      }
    }

    function loadSettings() {
      try {
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          controls = settings.controls;
          backgroundColor = settings.backgroundColor;
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }

    function saveSettings() {
      try {
        const settings = {
          controls: controls,
          backgroundColor: backgroundColor,
        };
        localStorage.setItem('gameSettings', JSON.stringify(settings));
      } catch (e) {
        console.error('Error saving settings:', e);
      }
    }

    export { init, gameLoop, setPlayerName, showTitleScreen, startGame };
