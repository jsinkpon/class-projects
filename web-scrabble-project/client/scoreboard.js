class WordScoreBoard {
  constructor() {
    this.words = [];
  }

  // TODO #8: Save the word score to the server
  async saveWordScore(name, word, score) {
    const data = {"name": name, "word": word, "score": score};
    this.words.push(data);
    try {
      const response = await fetch(`/wordScore?name=${name}&word=${word}&score=${score}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      const responseData = response.json();
      // console.log(responseData);
    }catch(err){
      console.log(err);
    }
  }

  render(element) {
    let html = '<h1>Word Scores</h1>';
    html += '<table>';
    this.words.forEach((word) => {
      html += `
        <tr>
          <td>${word.name}</td>
          <td>${word.word}</td>
          <td>${word.score}</td>
        </tr>
      `;
    });
    html += '</table>';
    element.innerHTML = html;
  }
}

class GameScoreBoard {
  constructor() {
    this.game = [];
  }

  render(element) {
    let html = '<h1>Game Score</h1>';
    html += '<table>';
    this.game.forEach((word) => {
      html += `
        <tr>
          <td>${word.name}</td>
          <td>${word.score}</td>
        </tr>
      `;
    });
    html += '</table>';
    element.innerHTML = html;
  }

  // TODO #9: Save the game score to the server
  async saveGameScore(name, score) {
    const data = {"name": name, "score": score};
    this.game.push(data);
    try {
      const response = await fetch(`/gameScore?name=${name}&score=${score}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      const responseData = response.json();
      // console.log(responseData);
    }catch(err){
      console.log(err);
    }

  }
}

class TopWordAndGameScoreBoard {
  // TODO #10: Render the top word and game scores
  async render(element) {
    const highestWordResponse = await fetch('/highestWordScores', {
      method: 'GET',
    });
    const highestGameResponse = await fetch('/highestGameScores', {
      method: 'GET',
    });
    const topWordArray = await highestWordResponse.json();
    const topGameArray = await highestGameResponse.json();
    let html = '<h1>Top 10 Word Scores</h1>';
    html += '<table>';
    html += `<tr> 
          <td> Player Name</td>
          <td> Player Word</td>
          <td> Player Score</td>
            </tr>`;
    topWordArray.forEach((word) => {
      html += `
        <tr>
          <td>${word.name}</td>
          <td>${word.word}</td>
          <td>${word.score}</td>
        </tr>
      `;
    });
    
    html += '</table>';
    let html2 = '<h1>Top 10 Game Scores</h1>';
    html2 += '<table>';
    html2 += `<tr> 
          <td> Player Name</td>
          <td> Player Score</td>
            </tr>`;
    topGameArray.forEach((game) => {
      html2 += `
        <tr>
          <td>${game.name}</td>
          <td>${game.score}</td>
        </tr>
      `;
    });
    html2 += '</table>';
    element.innerHTML = html + html2;
  }
}

// const wordScoreBoard2 = new WordScoreBoard();
// const gameScoreBoard2 = new GameScoreBoard();
// const topWordAndGameScoreBoard2 = new TopWordAndGameScoreBoard();


// await topWordAndGameScoreBoard2.render(document.getElementById('top-10-score-board'));

export const wordScoreBoard = new WordScoreBoard();
export const gameScoreBoard = new GameScoreBoard();
export const topWordAndGameScoreBoard = new TopWordAndGameScoreBoard();
