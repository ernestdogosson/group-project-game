
function Scoreboard({ topScore, score, total, streak }) {
  

  return (
    <div className="scoreboard">
      {/* Show the player's total score */}

      <p><strong>Topscore:</strong> {topScore}</p>

      <p><strong>Score:</strong> {score}</p>

      {/* How many rounds the player has answered */}
      <p><strong>Rounds Played:</strong> {total}</p>

      {/* Streak of consecutive correct answers */}
      <p><strong>Streak:</strong> {streak}</p>
    </div>
  );
}

export default Scoreboard;