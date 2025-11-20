<?php
// index.php - minimal PHP wrapper serving HTML (no DB)
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quiz (PHP + JS)</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="container">

  <!-- Setup -->
  <div id="setup">
    <h1>Start Quiz</h1>
    <label for="category">Category</label>
    <select id="category">
      <option value="math">Math</option>
      <option value="gk">General Knowledge</option>
      <option value="science">Science</option>
    </select>

    <label for="difficulty">Difficulty</label>
    <select id="difficulty">
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="hard">Hard</option>
    </select>

    <button id="start">Start Quiz</button>
  </div>

  <!-- Quiz -->
  <div id="quiz" class="hidden">
    <div class="quiz-header">
      <h2 id="qnum">Question</h2>
      <div class="timer">Time: <span id="time">0</span>s</div>
    </div>

    <h3 id="qtext"></h3>
    <ul id="opts" class="question-options"></ul>

    <div style="display:flex;gap:10px;">
      <button id="prev" class="hidden">Previous</button>
      <button id="next">Next</button>
    </div>
  </div>

  <!-- Results -->
  <div id="results" class="hidden">
    <h1>Results</h1>
    <div id="score"></div>
    <div id="summary"></div>
    <div id="chart-container">
      <canvas id="chart" width="400" height="180"></canvas>
    </div>
    <button id="restart">Restart</button>
  </div>

</div>

<!-- Chart.js CDN (plain JS) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="script.js"></script>
</body>
</html>
