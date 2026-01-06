import { useEffect, useState, useMemo } from "react";
import PokemonDisplay from "../components/PokemonDisplay";
import AnswerButtons from "../components/AnswerButtons";
import Scoreboard from "../components/Scoreboard";
import "./PokemonGame.css";

function PokemonGame({ currentUser, onLogout }) {
  // Game state variables
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [pokemon, setPokemon] = useState(null);
  const [options, setOptions] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // NEW: Loading state to hide pokemon completely during fetch
  const [isLoading, setIsLoading] = useState(false);

  // Score tracking
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);

  // Top score - saved in localStorage so it persists
  const [topScore, setTopScore] = useState(() => {
    const savedScore = localStorage.getItem("topScore");
    return savedScore ? parseInt(savedScore) : 0;
  });

  // Update top score when current score changes
  useEffect(() => {
    if (score > topScore) {
      setTopScore(score);
    }
  }, [score, topScore]);

  // Save top score to localStorage
  useEffect(() => {
    localStorage.setItem("topScore", topScore);
  }, [topScore]);

  // Difficulty settings: time limits and lives
  const DIFFICULTY_SETTINGS = useMemo(
    () => ({
      easy: { time: 60, lives: 5 },
      medium: { time: 45, lives: 3 },
      hard: { time: 30, lives: 1 },
    }),
    [],
  );

  const [difficulty, setDifficulty] = useState("medium");
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_SETTINGS["medium"].time);
  const [lives, setLives] = useState(DIFFICULTY_SETTINGS["medium"].lives);
  const [maxLives, setMaxLives] = useState(DIFFICULTY_SETTINGS["medium"].lives);

  // End the game
  const endGame = () => {
    setGameOver(true);
  };

  // Timer countdown - runs every second when game is active
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    if (timeLeft <= 0) {
      endGame();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, gameStarted, gameOver]);

  // Update time and lives when difficulty changes
  useEffect(() => {
    if (!gameStarted) {
      const settings = DIFFICULTY_SETTINGS[difficulty];
      setTimeLeft(settings.time);
      setLives(settings.lives);
      setMaxLives(settings.lives);
    }
  }, [difficulty, DIFFICULTY_SETTINGS, gameStarted]);

  // Restart game with same difficulty
  const restartGame = () => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    setScore(0);
    setTotal(0);
    setStreak(0);
    setTimeLeft(settings.time);
    setLives(settings.lives);
    setMaxLives(settings.lives);
    setGameOver(false);
    setGameStarted(true);
    fetchNewRound();
  };

  // Fetch new Pokemon round from PokeAPI
  const fetchNewRound = async () => {
    setIsLoading(true);
    setAnswered(false);
    setSelectedId(null);

    try {
      const ids = new Set();
      while (ids.size < 4) {
        ids.add(Math.floor(Math.random() * 1024) + 1);
      }

      const idsArray = Array.from(ids);

      const promises = idsArray.map((id) =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
          res.json(),
        ),
      );

      const pokemonData = await Promise.all(promises);

      const correctIndex = Math.floor(Math.random() * 4);

      const shuffled = [...pokemonData].sort(() => Math.random() - 0.5);

      // Preload the image BEFORE showing it
      const img = new Image();
      img.src =
        pokemonData[correctIndex].sprites.other[
          "official-artwork"
        ].front_default;
      await img.decode();

      // Now set the pokemon data
      setOptions(shuffled);
      setPokemon(pokemonData[correctIndex]);

      // Only show pokemon AFTER everything is ready
      setIsLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setIsLoading(false);
    }
  };

  // Start the game
  const startGame = () => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTotal(0);
    setStreak(0);
    setTimeLeft(settings.time);
    setLives(settings.lives);
    setMaxLives(settings.lives);
    fetchNewRound();
  };

  // Handle user's guess
  const handleGuess = (guessedPokemon) => {
    setAnswered(true);
    setSelectedId(guessedPokemon.id);
    setTotal((prev) => prev + 1);

    const isCorrect = guessedPokemon.id === pokemon.id;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => endGame(), 700);
        }
        return newLives;
      });
    }

    setTimeout(() => {
      if (lives > 1 || isCorrect) {
        fetchNewRound();
      }
    }, 700);
  };

  return (
    <div className="game-container">
      {/* User info and logout - shown before game starts */}
      {!gameStarted && !gameOver && (
        <div className="user-info">
          <span className="welcome-text">Welcome, {currentUser}!</span>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      )}

      {/* Logout button during game - always visible in top right */}
      {gameStarted && !gameOver && (
        <button onClick={onLogout} className="logout-btn-game">
          Logout
        </button>
      )}

      <h1 className="game-title">Who's That Pokemon?</h1>

      {/* Difficulty selector - only show before game starts */}
      {!gameStarted && !gameOver && (
        <form className="difficulty-form">
          <div className="select-difficulty">
            <label htmlFor="difficulty" className="difficulty-label">
              Difficulty:
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={`difficulty-dropdown ${difficulty}`}
            >
              <option value="easy" className="easy">
                Easy (60s • 5 Lives)
              </option>
              <option value="medium" className="medium">
                Medium (45s • 3 Lives)
              </option>
              <option value="hard" className="hard">
                Hard (30s • 1 Live)
              </option>
            </select>
          </div>
        </form>
      )}

      {gameStarted && !gameOver && pokemon && (
        <>
          <div className="game-layout">
            {/* LEFT BOX - Timer and Lives */}
            <div className="game-info">
              <div className="timer-circle-container">
                <svg className="timer-circle-svg" viewBox="0 0 120 120">
                  <circle className="timer-circle-bg" cx="60" cy="60" r="54" />
                  <circle
                    className={`timer-circle-progress ${timeLeft <= 10 ? "danger" : ""}`}
                    cx="60"
                    cy="60"
                    r="54"
                    style={{
                      strokeDashoffset:
                        339.292 *
                        (1 - timeLeft / DIFFICULTY_SETTINGS[difficulty].time),
                    }}
                  />
                </svg>
                <div className="timer-number-display">
                  <span
                    className={`timer-number ${timeLeft <= 10 ? "danger" : ""}`}
                  >
                    {timeLeft}
                  </span>
                </div>
              </div>

              <div className="lives-display">
                {Array.from({ length: maxLives }).map((_, i) => (
                  <span
                    key={i}
                    className={`heart ${i < lives ? "alive" : "dead"}`}
                  >
                    <i
                      className={i < lives ? "ri-heart-fill" : "ri-heart-line"}
                    ></i>
                  </span>
                ))}
              </div>
            </div>

            {/* CENTER - Pokemon Display */}
            <div className="pokemon-center">
              <div className="display-box">
                {isLoading ? (
                  <div className="loading-placeholder">?</div>
                ) : (
                  <PokemonDisplay pokemon={pokemon} answered={answered} />
                )}
              </div>

              <p className="pokemon-name-display">
                {answered && pokemon ? pokemon.name.toUpperCase() : ""}
              </p>
            </div>

            {/* RIGHT BOX - Scoreboard */}
            <div className="scoreboard-wrapper">
              <Scoreboard
                topScore={topScore}
                score={score}
                total={total}
                streak={streak}
              />
            </div>
          </div>

          {/* Answer Buttons - Below the layout */}
          <AnswerButtons
            options={options}
            onGuess={handleGuess}
            answered={answered || isLoading}
            correctId={pokemon.id}
            selectedId={selectedId}
          />
        </>
      )}

      {/* Start Screen */}
      {!gameStarted && !gameOver && (
        <div className="display-box">
          <button className="start-btn normal-text" onClick={startGame}>
            Start Game
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="display-box">
          <div className="end-screen">
            <h1 className="black">Game Over!</h1>
            <p className="scoreboard-text top-score">
              🏆 <i className="ri-trophy-fill"></i>Top Score:{topScore}
            </p>
            <p className="scoreboard-text final-score">Final Score: {score}</p>
            <p className="scoreboard-text">Rounds Played: {total}</p>
            <p className="scoreboard-text">Longest Streak: {streak}</p>
            <button
              className="start-btn scoreboard-text pulse"
              onClick={restartGame}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PokemonGame;
