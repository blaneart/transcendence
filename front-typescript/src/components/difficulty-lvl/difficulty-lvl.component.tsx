import React from "react";

import './difficulty-lvl.scss'

function Square(props: any) {
	return (
	  <button className="square" onClick={props.onClick}>
		{props.value}
	  </button>
	);
}
  
class Board extends React.Component<{difficultyLvl: any}, {square: string[]}> {
	constructor(props: any) {
		super(props);
		this.state = {
			square: ['Easy', '\\* Medium */', 'Hard', 'Impossible'],
		};
	}

	handleClick = (i: number) => {
		let squares = ['Easy', 'Medium', 'Hard', 'Impossible']
		squares[i] = '\\* ' + squares[i] + ' */';
		this.setState({
			square: squares,
		})
		this.props.difficultyLvl.number = i * 3 + 1;
	}

	renderSquare(i: number)
	{
		return (
			<Square
				value={this.state.square[i]}
				onClick={() => this.handleClick(i)}
			/>
		);
	}
  
	render() {
		return (
			<div>
				<div className="board-row">
					{this.renderSquare(0)}
					{this.renderSquare(1)}
					{this.renderSquare(2)}
					{this.renderSquare(3)}
				</div>
			</div>
		);
	}
  }
  
class Difficulty extends React.Component <{difficultyLvl: any}, {}> {

	render() {
		return (
			<div className="difficulty-item">
				<div className="game-board">
					<Board difficultyLvl={this.props.difficultyLvl}/>
				</div>
			</div>
		);
	}
}

export default Difficulty;