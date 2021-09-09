import React, { useState } from "react";

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
			square: ['1', '2', '3', 'current', '5', '6', '7'],
		};
	}

	handleClick = (i: number) => {
		let squares = []
		for (let j = 0; j < 7; j++)
			squares[j] = `${j + 1}`
			squares[i] = 'current';
		this.setState({
			square: squares,
		})
		this.props.difficultyLvl.number = i;
		console.log('in the difficulty.component.tsx file: ', this.props.difficultyLvl.number)
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
					{this.renderSquare(4)}
					{this.renderSquare(5)}
					{this.renderSquare(6)}
				</div>
			</div>
		);
	}
  }
  
class Difficulty extends React.Component <{difficultyLvl:any}, {}> {
	constructor(props: any) {
		super(props)
	}

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