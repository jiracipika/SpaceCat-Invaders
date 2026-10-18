import './motion.js';
import { init, gameLoop, setPlayerName, showTitleScreen, startGame } from './game.js';

    showTitleScreen();

    document.addEventListener('playerNameSet', () => {
      init();
      gameLoop();
    });
