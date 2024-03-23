import React from 'react';
import { FigureProps, FigureState } from './types/types';

export default class Figure extends React.Component<FigureProps, FigureState> {
  constructor(props: FigureProps) {
    super(props);
    
    this.state = { className: this.props.className, x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height, zIndex: this.props.zIndex };
    this.updateZIndex = this.updateZIndex.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  backgroundColorItems: Array<string> = ['#00a2e8', '#008728', '#ff7f27', '#880015'];
  backgroundColor: string = this.backgroundColorItems[Math.floor(Math.random() * 4)];

  updateZIndex(direction: 'up'|'down', callback: Function): void {
    this.setState((state: FigureState) => {
      if (direction == 'up') {
        state.zIndex++;
      } else {
        if (state.zIndex > 1) {
          state.zIndex--;
        }
      }

      callback();

      return state;
    });
  }

  updatePosition(x: number, y: number): void {
    this.setState((state: FigureState) => {
      state.x = x;
      state.y = y;

      return state;
    });
  }

  updateClassName(name: 'circle'|'rectangle'|'circle selected'|'rectangle selected') {
    this.setState((state: FigureState) => {
      state.className = name;

      return state;
    });
  }

  updateState(x: number, y: number, width: number, height: number): void {
    this.setState((state: FigureState) => {
      state.x = x;
      state.y = y;
      state.width = width;
      state.height = height;

      return state;
    });
  }

  render(): React.ReactNode {
    return (
      <div
        id={this.props.id.toString()}
        className={this.state.className}
        onMouseDown={(e: React.MouseEvent) => this.props.onMouseDown(e, this)}
        style=
        {
          {
            top: `${this.state.y}px`,
            left: `${this.state.x}px`,
            width: `${this.state.width}px`,
            height: `${this.state.height}px`,
            backgroundColor: `${this.backgroundColor}`,
            zIndex: `${this.state.zIndex}`
          }
        }
      >
      </div>
    )
  }
}