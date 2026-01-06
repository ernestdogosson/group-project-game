import { useEffect, useState, useMemo } from "react";
import PokemonDisplay from "../components/PokemonDisplay";
import AnswerButtons from "../components/AnswerButtons";
import Scoreboard from "../components/Scoreboard";
import "./PokemonGame.css";

function PokemonGame() {
  // Game state variables
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [pokemon, setPokemon] = useState(null);
  const [options, setOptions] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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
  // useMemo ensures this object is only created once, not on every render
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
    // Don't run timer if game hasn't started or is over
    if (!gameStarted || gameOver) return;

    // Create an interval that decreases timeLeft by 1 every second
    const timerId = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Cleanup: clear the interval when component unmounts or dependencies change
    return () => clearInterval(timerId);
  }, [gameStarted, gameOver]);

  // Update time and lives when difficulty changes
  useEffect(() => {
    if (!gameStarted) {
      const settings = DIFFICULTY_SETTINGS[difficulty];
      setTimeLeft(settings.time);
      setLives(settings.lives);
      setMaxLives(settings.lives);
    }
  }, [difficulty, gameStarted, DIFFICULTY_SETTINGS]);

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
    try {
      // Generate 4 unique random Pokemon IDs (1-151 for Gen 1)
      const ids = new Set();
      while (ids.size < 4) {
        ids.add(Math.floor(Math.random() * 151) + 1);
      }

      const idsArray = Array.from(ids);

      // Fetch all 4 Pokemon data in parallel
      const promises = idsArray.map((id) =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
          res.json(),
        ),
      );

      const pokemonData = await Promise.all(promises);

      // Pick one Pokemon as the correct answer
      const correctIndex = Math.floor(Math.random() * 4);

      // Shuffle all 4 Pokemon so correct answer isn't always in same position
      const shuffled = [...pokemonData].sort(() => Math.random() - 0.5);

      // Preload the correct Pokemon's image to prevent flash
      const img = new Image();
      img.src =
        pokemonData[correctIndex].sprites.other[
          "official-artwork"
        ].front_default;
      await img.decode();

      // Update state for new round
      setAnswered(false);
      setSelectedId(null);
      setOptions(shuffled);
      setPokemon(pokemonData[correctIndex]);
    } catch (err) {
      console.error("Error:", err);
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
      // Lose a life on wrong answer
      setLives((prev) => {
        const newLives = prev - 1;
        // End game if no lives left
        if (newLives <= 0) {
          setTimeout(() => endGame(), 700);
        }
        return newLives;
      });
    }

    // Auto-load next round after 700ms delay
    setTimeout(() => {
      if (lives > 1 || isCorrect) {
        fetchNewRound();
      }
    }, 700);
  };

  return (
    <div className="game-container">
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
                Easy (60s • 5 ❤️)
              </option>
              <option value="medium" className="medium">
                Medium (45s • 3 ❤️)
              </option>
              <option value="hard" className="hard">
                Hard (30s • 1 ❤️)
              </option>
            </select>
          </div>
        </form>
      )}

      {/* Timer and Lives display - only show during active game */}
      {gameStarted && !gameOver && (
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
            <span className="lives-label">Lives:</span>
            {Array.from({ length: maxLives }).map((_, i) => (
              <span key={i} className={`heart ${i < lives ? "alive" : "dead"}`}>
                {i < lives ? "❤️" : "🖤"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Scoreboard - always visible during game */}
      {gameStarted && !gameOver && (
        <div className="scoreboard-wrapper">
          <Scoreboard
            topScore={topScore}
            score={score}
            total={total}
            streak={streak}
          />
        </div>
      )}

      {/* Main display box */}
      <div className="display-box">
        {!gameStarted && !gameOver && (
          <button className="start-btn normal-text" onClick={startGame}>
            Start Game
          </button>
        )}

        {/* Game screen - Pokemon display */}
        {gameStarted && !gameOver && pokemon && (
          <PokemonDisplay pokemon={pokemon} answered={answered} />
        )}

        {/* Game over screen */}
        {gameOver && (
          <div className="end-screen">
            <h1 className="black">Game Over!</h1>
            <p className="scoreboard-text top-score">
              🏆 Top Score: {topScore}
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
        )}
      </div>

      {/* Pokemon name display - shows name after answering */}
      <p className="pokemon-name-display">
        {answered && pokemon ? pokemon.name.toUpperCase() : ""}
      </p>

      {/* Answer buttons - only show during active game */}
      {gameStarted && !gameOver && pokemon && (
        <AnswerButtons
          options={options}
          onGuess={handleGuess}
          answered={answered}
          correctId={pokemon.id}
          selectedId={selectedId}
        />
      )}
    </div>
  );
}

export default PokemonGame;
