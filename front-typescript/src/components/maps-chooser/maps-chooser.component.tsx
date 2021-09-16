import React, { useState } from "react";

import maps from './maps.component'
import './maps-chooser.scss'

function Square(props: any) {
	return (
	  <button className="square" onClick={props.onClick}>
		{props.value}
	  </button>
	);
}

function PowerUp(props: any) {
	return (
	  <button className="square" onClick={props.onClick}>
		{props.value}
	  </button>
	);
}


class Board extends React.Component<{history: any}, {square: string[], powerups: string[]}> {
	constructor(props: any) {
		super(props);
		this.state = {
			square: ['\\* MAP1 */', 'MAP2', 'MAP3'],
			powerups: ['\\* CLASSIC */', 'EXPLOSIVE']
		};
	}

	handleClickSquare = (i: number) => {
		let squares = ['MAP1', 'MAP2', 'MAP3']
		squares[i] = '\\* ' + squares[i] + ' */';
		this.setState({
			square: squares,
		})
		maps.map = i;
	}

	handleClickPowerUp = (i: number) => {
		let powerups = ['CLASSIC', 'EXPLOSIVE']
		powerups[i] = '\\* ' + powerups[i] + ' */';
		this.setState({
			powerups: powerups,
		})
		maps.powerup = (i === 1 ? true : false);
	}

	renderSquare(i: number)
	{
		return (
			<Square
				value={this.state.square[i]}
				onClick={() => this.handleClickSquare(i)}
			/>
		);
	}

	renderPowerUp(i: number)
	{
		return (
			<PowerUp
				value={this.state.powerups[i]}
				onClick={() => this.handleClickPowerUp(i)}
			/>
		);
	}

	launchGame(history: any)
	{
		history.push("/playbots/offline");
	}
	renderButton(history: any)
	{
		return (
			<button 
				onClick={() => this.launchGame(history)}>
				{"PLAY"}
			</button>
		)
	}

	render() {
		return (
			<div>
				<div className="board-row">
					{this.renderSquare(0)}
					{this.renderSquare(1)}
					{this.renderSquare(2)}
				</div>
				<div className="board-row">
					{this.renderPowerUp(0)}
					{this.renderPowerUp(1)}
				</div>
				<div className="button">
					{this.renderButton(this.props.history)}
				</div>
			</div>
		);
	}
  }
  
class Map extends React.Component <{history: any}, {}>{

	render() {
		return (
			<div className="map-item">
				<div className="game-board">
					<Board history={this.props.history}/>
				</div>
			</div>
		);
	}
}

export default Map;