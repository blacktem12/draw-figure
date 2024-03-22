import React from 'react';
import Figure from './Figure';

import type { FigureState } from './types/types';

type AppState = {
  figureItems: Array<React.ReactElement>;
};

type AddedFigureItem = {
  id: number;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  figure: React.RefObject<Figure>;
};

class App extends React.Component<{}, AppState> {
  constructor(props: any) {
    super(props);

    this.state = { figureItems: [] } as AppState;
    this.figureAreaOnMouseDown = this.figureAreaOnMouseDown.bind(this);
    this.figureAreaOnMouseMove = this.figureAreaOnMouseMove.bind(this);
    this.figureAreaOnMouseUp = this.figureAreaOnMouseUp.bind(this);
    this.figureOnMouseDown = this.figureOnMouseDown.bind(this);
    this.drawFigure = this.drawFigure.bind(this);
    this.moveFigure = this.moveFigure.bind(this);
  }

  id: number = 0;
  xPosition: number = 0;
  yPosition: number = 0;
  className: 'circle'|'rectangle' = 'circle';

  isDraw: boolean = false;
  clickedFigureXPosition: number = 0;
  clickedFigureYPosition: number = 0;
  selectedFigure: Figure|null = null;
  figure: React.RefObject<Figure>|null = null;
  addedItems: Array<AddedFigureItem> = [];

  figureAreaOnMouseDown(e: React.MouseEvent): void {
    if (!this.isDraw && this.selectedFigure == null) {
      let currentTarget = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      let targetXPosition = currentTarget.left;
      let targetYPosition = currentTarget.top;
      this.xPosition = e.clientX - targetXPosition - 3; // Element의 시작지점과 마우스 포인터의 차이를 두기 위해 3px 정도 왼쪽으로 당김.
      this.yPosition = e.clientY - targetYPosition + 25 - 3; // Button 영역의 높이값 25를 더하고, 마우스 포인터의 차이를 두기 위해 3px 정도 위로 당김.

      this.figure = React.createRef<Figure>();
      let element = React.createElement(Figure, {
        id: this.id,
        x: this.xPosition,
        y: this.yPosition,
        width: 0,
        height: 0,
        className: this.className,
        zIndex: 1,
        key: this.id,
        ref: this.figure,
        onMouseDown: this.figureOnMouseDown
      });

      this.setState((state: AppState) => {
        return { figureItems: [...state.figureItems, element] };
      });

      this.isDraw = true;
    }
  }

  figureAreaOnMouseMove(e: React.MouseEvent): void {
    let currentTarget = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    let currentXPosition = e.clientX - currentTarget.left - 3; // Element의 시작지점과 마우스 포인터의 차이를 두기 위해 3px 정도 왼쪽으로 당김.
    let currentYPosition = e.clientY - currentTarget.top + 25 - 3; // Button 영역의 높이값 25를 더하고, 마우스 포인터의 차이를 두기 위해 3px 정도 위로 당김.

    // Mouse click한 영역에 다른 element가 없는 경우 figure를 생성한다.
    if (this.isDraw) {
      this.drawFigure(currentXPosition, currentYPosition);
    } else if (this.selectedFigure != null) { // Mouse click시 해당 영역에 figure가 존재하면 해당 element의 좌표를 조정한다.
      this.moveFigure(currentXPosition, currentYPosition);
    }
  }

  figureAreaOnMouseUp(e: React.MouseEvent): void {
    if (this.selectedFigure == null) {
      const figureState = this.figure!.current!.state;

      this.addedItems.push({
        id: this.id,
        xPosition: figureState.x,
        yPosition: figureState.y,
        width: figureState.width,
        height: figureState.height,
        figure: this.figure as React.RefObject<Figure>
      });
    } else {
      const figureState = this.selectedFigure.state;
      const selectedItem = this.addedItems.filter((item) => item.id == this.selectedFigure!.props.id)[0];

      selectedItem.xPosition = figureState.x;
      selectedItem.yPosition = figureState.y;
    }

    this.isDraw = false;
    this.id++;
    this.xPosition = 0;
    this.yPosition = 0;
    this.selectedFigure = null;
    this.figure = null;
  }

  figureTypeButtonOnClick(className: 'circle'|'rectangle') {
    this.className = className;
  }

  figureOnMouseDown(e: React.MouseEvent, instance: Figure): void {
    e.preventDefault();
    e.stopPropagation();

    this.clickedFigureXPosition = e.clientX;
    this.clickedFigureYPosition = e.clientY;
    this.selectedFigure = instance;
  }

  /**
   * Figure의 좌표 및 넓이를 조정한다.
   * @param currentXPosition X 좌표
   * @param currentYPosition Y 좌표
   */
  private drawFigure(currentXPosition: number, currentYPosition: number): void {
    let xPosition = 0;
    let yPosition = 0;
    let width = 0;
    let height = 0;

    // 커서의 현재 좌표가 최초 element 생성시 X 좌표보다 작다면, element의 X 좌표를 커서의 위치로 조정한다.
    if (currentXPosition < this.xPosition) {
      xPosition = currentXPosition;
      width = this.xPosition - xPosition - 3;
    } else {
      xPosition = this.xPosition;
      width = currentXPosition - xPosition - 3;
    }

    // 커서의 현재 좌표가 최초 element 생성시 Y 좌표보다 작다면, element의 X 좌표를 커서의 위치로 조정한다.
    if (currentYPosition < this.yPosition) {
      yPosition = currentYPosition;
      height = this.yPosition - yPosition - 3;
    } else {
      yPosition = this.yPosition;
      height = currentYPosition - yPosition - 3;
    }

    this.figure!.current!.updateState(xPosition, yPosition, width, height);
  }

  /**
   * 선택된 figure의 위치를 재조정한다.
   * @param currentXPosition 현재 커서의 X 좌표
   * @param currentYPosition 현재 커서의 Y 좌표
   */
  private moveFigure(currentXPosition: number, currentYPosition: number): void {
    this.selectedFigure!.updatePosition(currentXPosition, currentYPosition);
  }

  render(): React.ReactNode {
    return (
      <div className='canvas'>
        <div className='figure-wrapper'>
          <div className='button-area'>
            <button type='button' onClick={(): void => this.figureTypeButtonOnClick('circle')}>Circle</button>
            <button type='button' onClick={(): void => this.figureTypeButtonOnClick('rectangle')}>Rectangle</button>
            <button type='button'>Up</button>
            <button type='button'>Down</button>
            <button type='button'>Remove</button>
            <button type='button'>Remove All</button>
          </div>
          <div className='figure-area' onMouseDown={this.figureAreaOnMouseDown} onMouseMove={this.figureAreaOnMouseMove} onMouseUp={this.figureAreaOnMouseUp}>
            {
              this.state.figureItems.map((element: React.ReactElement) => { return element; })
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;