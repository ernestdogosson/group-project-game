import "./ScoreBoard.css";

function Scoreboard({ topScore, score, total, streak }) {
  return (
    <div className="scoreboard">
      <p className="">
        <strong>Topscore:</strong> {topScore}
      </p>

      <p>
        <strong>Score:</strong> {score}
      </p>

      <p>
        <strong>Rounds Played:</strong> {total}
      </p>

      <p>
        <strong>Streak:</strong> {streak}
      </p>
    </div>
  );
}

export default Scoreboard;
