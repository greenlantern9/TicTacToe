const fs = require('fs');
const path = require('path');
const readline = require('readline');
const playerLetters = ['X','O','A','B','C','D','E','F','G','H','I','J','K','L','M','N','P','Q','R','S','T','U','V','W','Y','Z'];

//Default settings
var settings = {
    playerSize: 2,
    boardSize: 3,
    winSequence: 3,
    currentPlayer : 0
};

main();

//region SHAAKEED
function StartGameQuestions(){
    const rl = readline.createInterface(process.stdin, process.stdout);
  rl.question('Would you like to resume a saved game? (Y/N)\n', saved_game => {
    saved_game = saved_game.toUpperCase();
    if(saved_game === 'YES' || saved_game === 'Y'){
      console.log('You picked saved game.');
	  LoadGame();
      rl.close();
    }
    else if (saved_game === 'NO' || saved_game === 'N'){
      console.log('You picked a new game.');
      rl.question('How many players are there? (Maximum 26): ', players => {
        if(players <= 26){
          settings.playerSize = parseInt(players);
		  console.log(players);
          rl.question('How large is the board? (Maximum:999): ', board_size => {
            if(board_size <= 999){
              settings.boardSize = parseInt(board_size);
			  console.log(board_size);
              rl.question('What is the win sequence count? (# of symbols in a row) ', win_sequence => {
                if(win_sequence){
                  console.log(win_sequence);
				  settings.winSequence = parseInt(win_sequence);
                    rl.close();
                  beginGame(settings);
                }
                else{
                  console.log('Not a valid win sequence');
                  rl.close();
                }
              })
            }
            else{
              console.log('That board size is not valid');
              StartGameQuestions();
            }
          })
        }
        else{
          console.log('That amount of players is not valid');
          StartGameQuestions();
        }
      })
    }
    else{
      console.log('That is not a valid option.');
      StartGameQuestions();
    }
  })
}

var drawBoard = function(board_size){
	var board = '';

	//Row0 to start board numbers
	for(var row0 = 1; row0 <= board_size; row0++){
		if(row0 === 1){
			board += '    ' + row0;
		}
		else{
			board += '   ' + row0;
		}
	}

	//Rest of the rows and columns that setup the table
	for (var row = 1; row <= board_size; row++){
		board += '\n' + row + '     ';

		for(var column = 1; column < board_size; column++){
			board += '|   ';
		}
		board += '\n   ';

		if(row < board_size){
			for(var row_col = 0; row_col < (board_size * 2 - 1); row_col++){
				if(row_col % 2 !== 0){
					board += '+';
				}
				else{
					board += '---';
				}
			}
		}
	}
  return board;
};
//endregion

//region BRIAN
function LoadGame() {
    rl.question("Please enter your save file name " +
        "\nor press Return to see a list of saved games" +
        "\nor type Exit to return to the menu... \n", resp => {
        "use strict";
        if (resp == "") {
            ShowSavedGames(__dirname);
            console.log("\n");
            rl.close();
            LoadGame();
            return;
        }
        else if (resp.toUpperCase() == "EXIT") rl.close();
        else {

                LoadSavedGame(__dirname, resp);
				 }
        rl.close();

    })
}


function LoadSavedGame(dir, file) {
    "use strict";

    console.log("\n \t This will return the data:" +
        "\n \t - players" +
        "\n \t - boardSize" +
        "\n \t - heading" +
        "\n \t - winSequence" +
        "\n \tstored in " + dir + "\\" + file + ".xml");
    return;

}

function ShowSavedGames(dir) {
    
    console.log("\t this will be a list" +
        "\n  \t of save games" +
        "\n  \t that the user " +
        "\n  \t has saved to " +
        "\n  \t " + dir + "" +
        "\n  \t and can choose from");
    return;
}
//endregion

//region Kyle
var activeBoard = [];

function beginGame(settings) {
	console.log('****Game Started****');
	activeBoard = createMatrix(settings.boardSize);
	board = drawBoard(settings.boardSize);
	console.log(board);
    recursiveAsyncReadLine();
}

var createMatrix = function(board_size){
    let matrix = [];
    for (var i = 0; i < board_size; i++) {
        let row = [];
        for (var i1 = 0; i1 < board_size; i1++) {
            row.push(' ');
        }
        matrix.push(row);
    }

    console.log(matrix);
    return matrix;
};

function playerMoved(row, column, value){
    //console.log(row,column, value);
    if (activeBoard[row][column] === ' '){
      //  console.log('player has moved');
        activeBoard[row][column] = value;
        console.log(activeBoard);
        checkForWinner(activeBoard, value, row, column);
        return true;
    } else {
        console.log('a player exists in that space, move invalid');
        return false;
    }

}

var recursiveAsyncReadLine = function () {
    const rl = readline.createInterface(process.stdin, process.stdout);
    if (settings.currentPlayer >= settings.playerSize){
        settings.currentPlayer = 0; // first player's turn again
    }
    rl.question('Player '+  playerLetters[settings.currentPlayer] +', Please enter a row,column (you may also type save to save the game): ', function (answer) {
        //console.log(answer);
        if (answer == 'save') //we need some base case, for recursion
            return rl.close(); //closing RL and returning from function.
        console.log('Got it! Your answer was:  ' + answer +  '  "', playerLetters[settings.currentPlayer], '"');
        var canPlay = true;
        var grid = answer.split(',');
        var row = (parseInt(grid[0])-1),
            column = parseInt((grid[1])-1);

        if (row > (settings.boardSize-1) || row < 0){
            canPlay= false;
            console.log('invalid row coordinate');
        }

        if (column > (settings.boardSize-1) || column < 0){
            canPlay= false;
            console.log('invalid column coordinate');
        }

        if (canPlay){
            if (playerMoved(row, column, playerLetters[settings.currentPlayer])){
                settings.currentPlayer++;
            }
        }

        rl.close();
        recursiveAsyncReadLine();
    });
};

function checkForWinner(board, player, row, column){
    if (checkRows(board, player) || checkDiagonals(board, player, row, column) || checkDiagonalsOpp(board, player, row, column) || checkColumns(board, player)) {
        console.log('user has won');
    } else {
        console.log('not a winner');
    }
}

function checkRows(board, player){
    // Iterate thru the matrix rows, summing values
        var win = false;
        for(var r = 0; r < board.length; r++){
            var rowSum = 1;
            var previousVal = 'start';
            for(var t = 0; t < board[r].length; t++) {
                if (board[r][t] === player) {
                    ++rowSum;
                    //console.log('found the players letter', player);
                   // console.log('current row sum', ++rowSum);
                    if (previousVal !== board[r][t] && rowSum > 2) {
                        rowSum = 0;
                        //console.log('current value doesnt match prior current row sum', rowSum);
                    }
                }
                previousVal = board[r][t];
                //console.log('previous cell value: ', previousVal);
                if(rowSum > settings.winSequence){
                    win = true;
                    break;
                }
            }
        }
        return win;
}

function checkDiagonals(board, player, row, column){
   // console.log('checking diagonal');
    // 3,4
  //  console.log('player played ', row, column);
    var keepChecking = true;
    var hitCount = 1;
    var currentRow = row;
    var currentColumn = column;
    while (keepChecking){
        if(typeof board[++currentRow] === 'undefined') {
            keepChecking = false;
            console.log('out of the range of the matrix');
            break;
        }

        if(typeof board[currentRow][++currentColumn] === 'undefined') {
            keepChecking = false;
            console.log('out of the range of the matrix');
            break;
        }

        if (board[currentRow][currentColumn] == player) {
            console.log('diagonal hit down right');
            console.log('found hits:', ++hitCount);
            if (hitCount >= settings.winSequence)
                return true;
        } else {
            console.log('stop checking no more matches');
            keepChecking = false;
        }
    }

    currentRow = row;
    currentColumn = column;
    keepChecking = true;
    hitCount--; //subtract one because its going to add the original location again
    while (keepChecking){
        if(typeof board[++currentRow] === 'undefined') {
            keepChecking = false;
           // console.log('out of the range of the matrix');
            break;
        }

        if(typeof board[currentRow][++currentColumn] === 'undefined') {
            keepChecking = false;
        //    console.log('out of the range of the matrix');
            break;
        }

        if (board[currentRow][currentColumn] == player) {
        //    console.log('diagonal up left hit');
        //    console.log('found hits:', ++hitCount);
            if (hitCount >= settings.winSequence)
                return true;
        } else {
         //   console.log('stop checking no more matches');
            keepChecking = false;
        }
    }


    return false;
}

function checkDiagonalsOpp(board, player, row, column){
    //console.log('checking diagonal');
    // 3,4
    //console.log('player played ', row, column);
    var keepChecking = true;
    var hitCount = 1;
    var currentRow = row;
    var currentColumn = column;
    while (keepChecking){
        if(typeof board[--currentRow] === 'undefined') {
            keepChecking = false;
           // console.log('out of the range of the matrix');
            break;
        }

        if(typeof board[currentRow][++currentColumn] === 'undefined') {
            keepChecking = false;
         //   console.log('out of the range of the matrix');
            break;
        }

        if (board[currentRow][currentColumn] == player) {
         //   console.log('diagonal hit down right');
        //    console.log('found hits:', ++hitCount);
            if (hitCount >= settings.winSequence)
                return true;
        } else {
          //  console.log('stop checking no more matches');
            keepChecking = false;
        }
    }

    currentRow = row;
    currentColumn = column;
    keepChecking = true;
    hitCount--; //subtract one because its going to add the original location again
    while (keepChecking){
        if(typeof board[++currentRow] === 'undefined') {
            keepChecking = false;
          //  console.log('out of the range of the matrix');
            break;
        }

        if(typeof board[currentRow][--currentColumn] === 'undefined') {
            keepChecking = false;
            console.log('out of the range of the matrix');
            break;
        }

        if (board[currentRow][currentColumn] == player) {
          //  console.log('diagonal up left hit');
         //   console.log('found hits:', ++hitCount);
            if (hitCount >= settings.winSequence)
                return true;
        } else {
          //  console.log('stop checking no more matches');
            keepChecking = false;
        }
    }


    return false;
}

function checkColumns(board, player){
    function transpose(a) {
        return Object.keys(a[0]).map(
            function (c) { return a.map(function (r) { return r[c]; }); }
        );
    }

    return checkRows(transpose(board), player);
}

function tieCheck(board, players){

}

function saveGame() {
    console.log('save game has ran');
}
//endregion

function main(){
  console.log('Welcome to Advanced Customized Tic-Tac-Toe');
  console.log(
    '                  |   |   \n' +
    '               ---+---+--- \n' +
    '                  |   |   \n' +
    '               ---+---+--- \n' +
    '                  |   |   \n');
	
	StartGameQuestions();
}