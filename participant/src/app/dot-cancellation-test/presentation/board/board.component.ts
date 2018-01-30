import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { NgIf } from '@angular/common';

declare var angular: any;
@Component({
	selector: 'board',
	templateUrl: './board.component.html',
	styleUrls: ['./board.component.scss']
})
export class BoardComponent {
	constructor() {

		//Show the instructions by default when first loading the app	
		this.ToggleInstructionsandBoard();

		//Randomly populate dots on each cell
		this.RandomlyPopulateDots();

		//Iterate over each cell in each row and ensure 8 groups of 4 per row 
		this.EnsureEightGroupsOfFoursPerRow();

		//this.CentreDotsWithinEachCell();

		//Randomly position the dots within their cell
		this.RandomlyPositionDots();

		//Highlight all the groups of 4 dots
		//this.HighlightGroupsOf4();	
	}

	//Variables for the results 
	falseNegatives;
	falsePositives;
	trueNegatives;
	truePositives;

	//if true then the results div is shown
	showResults = false;

	//if true then user can mark cells after the first row
	isBoardUnlocked = false;

	//The height of the results div
	public resultsHeight: number = 0;

	//The timer object
	countDown;

	// Seconds the timer Starts on - (900 Seconds/15 Minutes)
	counter = 900;

	//The unit the timer decrements in (1 second)
	tick = 1000;

	//Total number of cells on the Board (each cell is a group of dots)
	public NumberOfCells = 625;

	//Stores the final time taken to complete the test
	TimeTaken;

	//Text of the test button
	testButtonText = 'Start Test';

	//Holds the clicks per cell
	dictionaryOfCellClicks = {};

	startTest = false;

	testTitle = 'Dot Cancellation Test';

	//Variables to show and hide instructions
	instructionVisibiliy = "'visible'";
	instructionsButtonText = 'Hide Instructions';
	public instructionHeight: number = 0;
	showInstructions = false;
	disableInstructions = false;

	//Decides the class of the board container
	containerClass = 'hideContainer';

	//An array to save if the cell has been selected or not  
	cellsSelected = Array(this.NumberOfCells).fill(null);

	//An array for each dot 
	dotones = Array(this.NumberOfCells).fill(null);
	dottwos = Array(this.NumberOfCells).fill(null);
	dotthrees = Array(this.NumberOfCells).fill(null);
	dotfours = Array(this.NumberOfCells).fill(null);
	dotfives = Array(this.NumberOfCells).fill(null);

	//Arrays for the x and y positions of each dot within each cell
	dotoneX = Array(this.NumberOfCells).fill(null);
	dotoneY = Array(this.NumberOfCells).fill(null);

	dotTwoX = Array(this.NumberOfCells).fill(null);
	dotTwoY = Array(this.NumberOfCells).fill(null);

	dotThreeX = Array(this.NumberOfCells).fill(null);
	dotThreeY = Array(this.NumberOfCells).fill(null);

	dotFourX = Array(this.NumberOfCells).fill(null);
	dotFourY = Array(this.NumberOfCells).fill(null);

	dotFiveX = Array(this.NumberOfCells).fill(null);
	dotFiveY = Array(this.NumberOfCells).fill(null);

	//Reieves the GameTitle, instructiontitle, Instructions, Testbuttontext
	InitGametext() {

	}

	//Starts a countdown from value of counter when called
	StartCountDownTimer() {
		this.countDown = Observable.timer(0, this.tick)
			.take(this.counter)
			.map(() => --this.counter)
	}

	// toggles between Showing board and hiding instructions
	ToggleInstructionsandBoard() {
		if (this.showInstructions) {
			//Hide Instructions, show board
			this.containerClass = 'showContainer';
			this.instructionsButtonText = 'Show Instructions (Hide Test)';
			this.showInstructions = false;
			this.instructionHeight = 3;
		}
		else if (!this.showInstructions) {
			//Show Instructions, hide board  
			this.containerClass = 'hideContainer';
			this.instructionHeight = 200;
			this.instructionsButtonText = 'Hide Instructions (Show Test)';
			this.showInstructions = true;
		}
	}

	//Hides both  instructions and the test board
	HideInstructionsAndTest() {
		this.containerClass = 'hideContainer';
		this.instructionHeight = 0;
		this.showInstructions = false;
	}

	CentreDotsWithinEachCell(i, NoOfDots) {

		// Xvalues = Array(5).fill(null); 
		//for each dot if it is populated then centre it relative to the cell
		//   for (var i = 0; i < this.dotones.length; i++)
		if (NoOfDots == 5) {
			this.dotoneX[i] = -15;
			this.dotTwoX[i] = -8;
			this.dotThreeX[i] = 0;
			this.dotFourX[i] = 8;
			this.dotFiveX[i] = 15;
		}

		if (NoOfDots == 3) {
			this.dotoneX[i] = -15;
			this.dotTwoX[i] = -8;
			this.dotThreeX[i] = 0;
			this.dotFourX[i] = 8;
			this.dotFiveX[i] = 12;
		}
	}

	//Returns an array of results with (TruePos, TrueNeg, FalsePos, FalseNeg)
	GetResults() {
		var results = Array(4).fill(null);

		//Miss out the first row as that is a practice row
		let TruePos = 0;
		let TrueNeg = 0;
		let FalsePos = 0;
		let FalseNeg = 0;

		for (var i = 25; i < this.dotones.length; i++) {

			//get no of dots
			let numOfDots: number = this.GetNumberOfDotsForCell(i);

			//Store if ticked or not
			let ticked: boolean = (this.cellsSelected[i] == "X");

			if (ticked) {
				if (numOfDots == 4) {
					//if ticked and 4 then TruePos
					TruePos += 1;
				}
				else {
					//else if ticked and not 4 then TrueNeg
					TrueNeg += 1;
				}
			}
			else if (!ticked) {
				if (numOfDots == 4) {
					//else if not ticked and 4 then FalsePos
					FalsePos += 1;
				}
				else {
					// else if not ticked and not 4 then FalseNeg
					FalseNeg += 1;
				}
			}
		}

		results[0] = (TruePos);
		results[1] = (TrueNeg);
		results[2] = (FalsePos);
		results[3] = (FalseNeg);

		return results;
	}

	//Highlights and marks cell selected
	HighlightCell(position) {
		//Check if the user has started the test
		if (((position > 24) && (this.isBoardUnlocked)) || (position < 25)) {
			this.cellsSelected[position] = 'X';
			this.dictionaryOfCellClicks[position] += 1;
		}
	}

	//Calculates and returns the number of dots for cell position passed in
	GetNumberOfDotsForCell(position) {
		var result = 0;
		if (this.dotones[position] == ".") { result = result + 1; }
		if (this.dottwos[position] == ".") { result = result + 1; }
		if (this.dotthrees[position] == ".") { result = result + 1; }
		if (this.dotfours[position] == ".") { result = result + 1; }
		if (this.dotfives[position] == ".") { result = result + 1; }

		return result;
	}

	//Gets random xvalues for a cell
	GetXValues() {
		var XValues = Array(5).fill(null);

		//Populate an Array of all the X Values of the Dots
		XValues[0] = this.GetRandomInt(-5, -13);
		XValues[1] = this.GenerateRandomWholeNum("X");
		XValues[2] = this.GenerateRandomWholeNum("X");
		XValues[3] = this.GenerateRandomWholeNum("X");
		XValues[4] = this.GetRandomInt(6, 11);

		return (XValues);
	}

	//Gets random yvalues for a cell
	GetYValues() {
		var YValues = Array(5).fill(null);
		YValues[0] = this.GenerateRandomWholeNum("Y");
		YValues[1] = this.GenerateRandomWholeNum("Y");
		YValues[2] = this.GenerateRandomWholeNum("Y");
		YValues[3] = this.GenerateRandomWholeNum("Y");
		YValues[4] = this.GenerateRandomWholeNum("Y");

		return YValues;
	}

	//Randomly position dots within each cell
	RandomlyPositionDots() {
		var X = "X";
		var Y = "Y";
		var XValues = this.GetXValues();
		var YValues = this.GetYValues();

		for (var i = 0; i < this.dotoneX.length; i++) {
			// While dots are touching
			//while (this.isDotsTouchingTwo(XValues, YValues))
			XValues = this.GetXValues();
			YValues = this.GetYValues();

			this.dotoneX[i] = XValues[0];
			this.dotoneY[i] = YValues[0]

			this.dotTwoX[i] = XValues[1];
			this.dotTwoY[i] = YValues[1];

			this.dotThreeX[i] = XValues[2];
			this.dotThreeY[i] = YValues[2];

			this.dotFourX[i] = XValues[3];
			this.dotFourY[i] = YValues[3]

			this.dotFiveX[i] = XValues[4];
			this.dotFiveY[i] = YValues[4];
		}
	}

	differenceLessThan2(x1, y1, x2, y2) {

		// console.log("Num1 is ", num1);
		//console.log("Num2 is ", num2);

		//if difference < 2 return false else return true
		// var result = Math.abs(num1 - num2);

		// if (Math.sign(result) == -1 )
		// {
		// result = result*-1;
		// }

		// if (result<2)
		// {
		// console.log("Num1 is ", num1);
		// console.log("Num2 is ", num2);
		// console.log("CALCCC IS ", result);
		// }



		var x_dist = (x2 - x1);
		var y_dist = (y2 - y1);
		var distance = Math.sqrt((x_dist * x_dist) + (y_dist * y_dist));

		//console.log("CALCCC IS ", distance);

		if (distance < 4) {
			console.log("CALCC IS:", distance);
			console.log("VALUES ARE: ", x1, y1, x2, y2);

		}
		return (distance < 7);

	}


	isDotsTouchingTwo(XValues, YValues) {
		var result = false;
		for (var i = 0; i < XValues.length; i++) {
			for (var j = i + 1; j < XValues.length; j++) {
				if (this.differenceLessThan2(XValues[i], YValues[i], XValues[j], YValues[j])) {
					return true;
				}
			}
		}
		return result;
	}

	// isDotsTouching(XValues, YValues)
	// {
	// var result = false;

	// check x with every other x, if same then check y if y same then false

	// var XValuesTouching = false;
	// var YValuesTouching = false;

	// console.log("Got here");

	// for (var i =0; i< XValues.length; i++ )
	// {
	// for (var j =i+1; j<XValues.length; j++ )
	// {
	// if ( this.differenceLessThan2(XValues[i],XValues[j] ))
	// {
	// XValuesTouching = true;
	// }				  
	// }

	// } 

	// console.log("Got here 2");

	// If x values touching then check y values touching
	// if (XValuesTouching)
	// {
	// for (var i =0; i< YValues.length; i++ )
	// {
	// for (var j =i+1; j < YValues.length; j++ )
	// {
	// if ( this.differenceLessThan2(YValues[i],YValues[j] ))
	// {
	// YValuesTouching = true;
	// }				  
	// }

	// } 
	// }

	// Only if y and x values touching 
	// if (( XValuesTouching== true) && (YValuesTouching==true))
	// {
	// result = true;
	// }
	// else
	// {
	// result = false;
	// }



	// return result;

	// }

	//Returns a random int between min and max range
	GetRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	//Generates a random x or y position within boundaries of cell
	GenerateRandomWholeNum(XorY) {
		var Range = 0;
		if (XorY == "X") {
			Range = 4;
		}
		else {
			Range = 6;
		}

		var result = (Math.floor(Math.random() * Range));

		if (Math.random() >= 0.5) {
			result = result * -1;
		}

		return result;
	}

	//Iterates over each cell and highlights the groups of 4
	HighlightGroupsOf4() {
		for (var i = 0; i < this.dotones.length; i++) {
			if (this.GetNumberOfDotsForCell(i) == 4) {
				this.HighlightCell(i);
			}
		}
	}

	//Iterate over each cell in each row and ensure 8 groups of 4 per row 
	EnsureEightGroupsOfFoursPerRow() {
		let numOfGroupsOfFourDots: number = 0;

		let randomPosition: number = 0;

		let EndOfRow: number = 24;

		let max: number = 0;

		let min: number = 0;

		for (var i = 0; i < this.dotones.length; i++) {

			// If group of dots == 4 then cummulate
			if (this.GetNumberOfDotsForCell(i) == 4) {
				numOfGroupsOfFourDots += 1;
			}

			//If end of row reached
			if (i == EndOfRow) {
				//init min and max for random number selection
				max = EndOfRow;

				min = i - 25;

				//While not 8 groups of 4
				while (numOfGroupsOfFourDots != 8) {
					if (numOfGroupsOfFourDots < 8) {
						do {
							//Choose a random number between 0 - 24, make sure it is not already a group of 4
							randomPosition = this.GetRandomInt(min, max);
						} while (this.GetNumberOfDotsForCell(randomPosition) == 4)
						//Change that random position to be a group of 4
						this.RandomlyPopulateFourDotsInPosition(randomPosition);
						numOfGroupsOfFourDots += 1;
					}
					else if (numOfGroupsOfFourDots > 8) {
						do {
							//Choose a random number between 0 - 24, make sure it is not already a group of 4
							randomPosition = this.GetRandomInt(min, max);
						} while (this.GetNumberOfDotsForCell(randomPosition) != 4)
						//Change that random position to be a group of 4
						this.RandomlyPopulateThreeOrFiveDotsInPosition(randomPosition);
						numOfGroupsOfFourDots -= 1;
					}
				}
				//reset 
				numOfGroupsOfFourDots = 0;
				EndOfRow += 25;
			}
		}
	}

	//Populate 4 dots in position selected
	RandomlyPopulateFourDotsInPosition(position) {
		var NoOfDots = 4;

		var dotsToInit = [1, 2, 3, 4, 5];

		//Clear dots
		this.dotones[position] = "";
		this.dottwos[position] = "";
		this.dotthrees[position] = "";
		this.dotfours[position] = "";
		this.dotfives[position] = "";

		//Until the number of dots chosen has been populated
		while (this.GetNumberOfDotsForCell(position) != NoOfDots) {

			//Rand choose either 1,2,3,4 or 5 to populate 
			var RowNum = dotsToInit[Math.floor(Math.random() * dotsToInit.length)];
			if (RowNum == 1) {
				this.dotones[position] = ".";
			}
			else if (RowNum == 2) {
				this.dottwos[position] = ".";
			}
			else if (RowNum == 3) {
				this.dotthrees[position] = ".";
			}
			else if (RowNum == 4) {
				this.dotfours[position] = ".";
			}
			else if (RowNum == 5) {
				this.dotfives[position] = ".";
			}
		}
	}

	//Populate 3 or 5 dots in position selected
	RandomlyPopulateThreeOrFiveDotsInPosition(position) {
		var NoOfDots = [3, 5];
		var dotsToInit = [1, 2, 3, 4, 5];

		//Clear dots
		this.dotones[position] = "";
		this.dottwos[position] = "";
		this.dotthrees[position] = "";
		this.dotfours[position] = "";
		this.dotfives[position] = "";

		//Rand choose either 3 or 5 dots 
		var rand = NoOfDots[Math.floor(Math.random() * NoOfDots.length)];

		//Until the number of dots chosen has been populated
		while (this.GetNumberOfDotsForCell(position) != rand) {

			//Rand choose either 1,2,3,4 or 5 to populate 
			var RowNum = dotsToInit[Math.floor(Math.random() * dotsToInit.length)];
			if (RowNum == 1) {
				this.dotones[position] = ".";
			}
			else if (RowNum == 2) {
				this.dottwos[position] = ".";
			}
			else if (RowNum == 3) {
				this.dotthrees[position] = ".";
			}
			else if (RowNum == 4) {
				this.dotfours[position] = ".";
			}
			else if (RowNum == 5) {
				this.dotfives[position] = ".";
			}
		}
	}

	//Populate 3,4 or 5 dots in each position
	RandomlyPopulateDots() {

		var NoOfDots = [3, 4, 5];
		var dotsToInit = [1, 2, 3, 4, 5];

		for (var i = 0; i < this.dotones.length; i++) {

			this.dictionaryOfCellClicks[i] = 0;

			//Rand choose either 3,4 or 5 dots 
			var rand = NoOfDots[Math.floor(Math.random() * NoOfDots.length)];
			//Until the number of dots chosen has been populated
			while (this.GetNumberOfDotsForCell(i) != rand) {

				//Rand choose either 1,2,3,4 or 5 to populate 
				var RowNum = dotsToInit[Math.floor(Math.random() * dotsToInit.length)];
				if (RowNum == 1) {
					this.dotones[i] = ".";
				}
				else if (RowNum == 2) {
					this.dottwos[i] = ".";
				}
				else if (RowNum == 3) {
					this.dotthrees[i] = ".";
				}
				else if (RowNum == 4) {
					this.dotfours[i] = ".";
				}
				else if (RowNum == 5) {
					this.dotfives[i] = ".";
				}
			}
		}
	}

	TEST() {
		this.TimeTaken = this.counter;
	}

	//returns the total time taken to do test
	GetTimeTaken() {
		return (900 - this.counter);
	}

	RestartGame() {

		//Start Test
		if (!this.startTest) {

			//unlock board
			this.isBoardUnlocked = true;
			this.startTest = true;
			this.testButtonText = 'Finish Test';

			//Disable instructions button
			this.disableInstructions = true;

			//Hide instructions and show the board
			this.showInstructions = true;
			this.ToggleInstructionsandBoard();

			//Start countdown timer from 15 mins	
			this.StartCountDownTimer();

			//Log All Interactions	
		}
		else if (this.startTest) {

			//ON FINISH GAME
			this.startTest = false;

			//Get time taken to complete test
			this.TimeTaken = this.GetTimeTaken();

			//Get Results
			var results = this.GetResults();
			console.log("TruePos  :", results[0]);
			console.log("TrueNeg  :", results[1]);
			console.log("FalsePos : ", results[2]);
			console.log("FalseNeg : ", results[3]);

			//Hide Test and Insructuons
			this.HideInstructionsAndTest();

			//Show Results	
			this.showResults = true;
			this.resultsHeight = 200;
			this.truePositives = results[0];
			this.trueNegatives = results[1];
			this.falsePositives = results[2];
			this.falseNegatives = results[3];


			//Get All Interactions
			//Dictionary of all the clicks per cell {CellPosition : NoOfClicks}
			var NoOfClicksPerCell = this.dictionaryOfCellClicks;
		}
	}

}
