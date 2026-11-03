var $ = id => document.getElementById(id);
var LEVELS = { easy: [10, 2000], medium: [12, 1500], hard: [14, 1000] }; // [target, ms ball takes]
var RESULTS = {
  six:    ["That's gone into the stands!", 6],
  four:   ['Cracked through the covers for four!', 4],
  one:    ['Just a single.', 1],
  dot:    ['Swing and a miss. Dot ball.', 0],
  wicket: ['Bowled him! Timber!', 0]
};
var runs, balls, wickets, timer, pending, start, active;

var level = () => LEVELS[$('level').value];
var progress = () => (Date.now() - start) / level()[1];   // 0 = bowled, 1 = reaches batter

function show() {
  var best = localStorage.getItem('best-' + $('level').value);
  $('need').textContent = level()[0] - runs;
  $('balls').textContent = balls;
  $('wickets').textContent = wickets;
  $('best').textContent = best === null ? '-' : best + ' balls left';
}

function stop() {
  clearInterval(timer);
  clearTimeout(pending);
  active = false;
}

function newGame() {
  stop();
  $('ball').style.top = '0px';
  runs = wickets = 0;
  balls = 6;
  $('end').style.display = 'none';
  $('commentary').textContent = 'Get ready...';
  show();
  pending = setTimeout(bowl, 1000);
}

function bowl() {
  active = true;
  start = Date.now();
  timer = setInterval(function () {
    $('ball').style.top = progress() * 280 + 'px';
    if (progress() >= 1) result('miss');
  }, 20);
}

function hit() {
  if (!active) return;
  var diff = Math.abs(progress() - 0.82);   // 0.82 = ball is in the middle of the green zone
  result(diff < 0.05 ? 'six' : diff < 0.12 ? (Math.random() < 0.5 ? 'four' : 'one') : 'miss');
}

function result(kind) {
  stop();
  if (kind == 'miss') kind = Math.random() < 0.4 ? 'wicket' : 'dot';
  runs += RESULTS[kind][1];
  balls--;
  if (kind == 'wicket') wickets++;
  $('commentary').textContent = RESULTS[kind][0];
  show();
  pending = setTimeout(next, 1500);
}

function next() {
  $('ball').style.top = '0px';
  if (runs >= level()[0] || balls == 0 || wickets == 3) return end(runs >= level()[0]);
  bowl();
}

function end(won) {
  var key = 'best-' + $('level').value;
  $('endText').textContent = won ? 'You win with ' + balls + ' ball(s) left!'
                                 : 'You lose. You scored ' + runs + ' of ' + level()[0] + '.';
  if (won && balls > Number(localStorage.getItem(key) || -1)) localStorage.setItem(key, balls);  // best = most balls left
  $('end').style.display = 'block';
  show();
}

$('hit').onclick = hit;
$('again').onclick = newGame;
$('level').onchange = newGame;
document.onkeydown = e => { if (e.code == 'Space') { e.preventDefault(); hit(); } };

newGame();
