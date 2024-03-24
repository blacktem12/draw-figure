import React from 'react';
import Figure from './Figure';

type AppState = {
  figureItems: Array<React.ReactElement>;
};

type AddedFigureItem = {
  id: number;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  className: string;
  zIndex: number;
};

export default class App extends React.Component<{}, AppState> {
  constructor(props: any) {
    super(props);

    this.figureAreaOnMouseDown = this.figureAreaOnMouseDown.bind(this);
    this.figureAreaOnMouseMove = this.figureAreaOnMouseMove.bind(this);
    this.figureAreaOnMouseUp = this.figureAreaOnMouseUp.bind(this);
    this.figureOnMouseDown = this.figureOnMouseDown.bind(this);
    this.removeAllButtonOnClick = this.removeAllButtonOnClick.bind(this);
    this.removeSelectionButtonOnClick = this.removeSelectionButtonOnClick.bind(this);
    this.changeIndexButtonOnClick = this.changeIndexButtonOnClick.bind(this);
    this.removeSelectedFigureButtonOnClick = this.removeSelectedFigureButtonOnClick.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
    this.drawFigure = this.drawFigure.bind(this);
    this.moveFigure = this.moveFigure.bind(this);
    this.setDataToStorage = this.setDataToStorage.bind(this);

    const data = localStorage.getItem(this.storageKey);

    if (data) {
      const figureItems = [];
      this.addedItems = JSON.parse(data);
      
      for (let item of this.addedItems) {
        this.figure = React.createRef<Figure>();
        let element = React.createElement(Figure, {
          id: item.id,
          x: item.xPosition,
          y: item.yPosition,
          width: item.width,
          height: item.height,
          className: item.className as any,
          zIndex: item.zIndex,
          key: item.id,
          ref: this.figure,
          onMouseDown: this.figureOnMouseDown
        });

        this.id = item.id + 1;

        figureItems.push(element);
      }

      this.state = { figureItems: figureItems } as AppState;
    } else {
      this.state = { figureItems: [] } as AppState;
    }
  }

  readonly storageKey = 'Data';
  readonly figureAreaHeight: number = 25;
  readonly gab = 3;

  id: number = 0;
  xPosition: number = 0;
  yPosition: number = 0;
  className: 'circle'|'rectangle'|'circle selected'|'rectangle selected' = 'circle';

  isDraw: boolean = false;
  clickedFigureXPosition: number = 0;
  clickedFigureYPosition: number = 0;
  selectedFigure: Figure|null = null;
  figure: React.RefObject<Figure>|null = null;
  addedItems: Array<AddedFigureItem> = [];
  keepClicked: boolean = false;

  figureAreaOnMouseDown(e: React.MouseEvent): void {
    if (!this.isDraw && this.selectedFigure == null) {
      let currentTarget = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      let targetXPosition = currentTarget.left;
      let targetYPosition = currentTarget.top;
      this.xPosition = e.clientX - targetXPosition - this.gab; // Element의 시작지점과 마우스 포인터의 차이를 두기 위해 3px 정도 왼쪽으로 당김.
      this.yPosition = e.clientY - targetYPosition + this.figureAreaHeight - this.gab; // Button 영역의 높이값 25를 더하고, 마우스 포인터의 차이를 두기 위해 3px 정도 위로 당김.

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

      this.setState((state: AppState): AppState => {
        return { figureItems: [...state.figureItems, element] };
      });

      this.isDraw = true;
    }

    this.keepClicked = true;
  }

  figureAreaOnMouseMove(e: React.MouseEvent): void {
    let currentTarget = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    let currentXPosition = e.clientX - currentTarget.left - this.gab; // Element의 시작지점과 마우스 포인터의 차이를 두기 위해 3px 정도 왼쪽으로 당김.
    let currentYPosition = e.clientY - currentTarget.top + this.figureAreaHeight - this.gab; // Button 영역의 높이값 25를 더하고, 마우스 포인터의 차이를 두기 위해 3px 정도 위로 당김.

    // Mouse click한 영역에 다른 element가 없는 경우 figure를 생성한다.
    if (this.isDraw) {
      this.drawFigure(currentXPosition, currentYPosition);
    } else if (this.selectedFigure != null && this.keepClicked) {
      // Mouse click시 해당 영역에 figure가 존재하면 해당 element의 좌표를 조정한다.
      this.moveFigure(currentTarget, currentXPosition, currentYPosition);
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
        zIndex: figureState.zIndex,
        className: figureState.className
      });
    } else {
      const figureState = this.selectedFigure.state;
      const selectedItem = this.addedItems.find((item: AddedFigureItem): boolean => item.id == this.selectedFigure!.props.id);

      selectedItem!.xPosition = figureState.x;
      selectedItem!.yPosition = figureState.y;
    }

    this.setDataToStorage();

    this.isDraw = false;
    this.id++;
    this.xPosition = 0;
    this.yPosition = 0;
    this.keepClicked = false;
    this.figure = null;
  }

  figureTypeButtonOnClick(className: 'circle'|'rectangle') {
    this.className = className;
  }

  figureOnMouseDown(e: React.MouseEvent, instance: Figure): void {
    this.clearSelection();

    const figureArea = (e.target as HTMLDivElement).closest('.figure-area')?.getBoundingClientRect();

    this.clickedFigureXPosition = e.clientX - figureArea!.left - instance.state.x;
    this.clickedFigureYPosition = e.clientY - figureArea!.top - instance.state.y;
    this.selectedFigure = instance;
    instance.updateClassName(instance.state.className + ' selected' as any);
  }

  removeAllButtonOnClick(e: React.MouseEvent): void {
    this.clearSelection();

    this.setState((state: AppState): AppState => {
      state.figureItems = [];

      return state;
    });

    this.addedItems = [];
    this.setDataToStorage();
  }

  removeSelectionButtonOnClick(e: React.MouseEvent): void {
    this.clearSelection();
  }

  changeIndexButtonOnClick(isIncrease?: boolean): void {
    if (this.selectedFigure) {
      const callback = () => {
        const selectedItem = this.addedItems.find((item: AddedFigureItem): boolean => item.id == this.selectedFigure!.props.id) as AddedFigureItem;

        selectedItem.zIndex = this.selectedFigure!.state.zIndex;

        this.setDataToStorage();
      }

      if (isIncrease) {
        this.selectedFigure.updateZIndex('up', callback);
      } else {
        this.selectedFigure.updateZIndex('down', callback);
      }
    }
  }

  removeSelectedFigureButtonOnClick(e: React.MouseEvent): void {
    if (this.selectedFigure) {
      this.setState((state: AppState): AppState => {
        const figureItems = [];

        for (let item of state.figureItems) {
          if (item.props.id != this.selectedFigure?.props.id) {
            figureItems.push(item);
          }
        }

        for (let i = 0; i < this.addedItems.length; i++) {
          if (this.addedItems[i].id == this.selectedFigure?.props.id) {
            this.addedItems.splice(i, 1);
            this.setDataToStorage();

            break;
          }
        }

        state.figureItems = figureItems;

        this.clearSelection();

        return state;
      });
    }
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
      width = this.xPosition - xPosition - this.gab;
    } else {
      xPosition = this.xPosition;
      width = currentXPosition - xPosition - this.gab;
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
  private moveFigure(currentTarget: DOMRect, currentXPosition: number, currentYPosition: number): void {
    let newXPosition = currentXPosition - this.clickedFigureXPosition;
    let newYPosition = currentYPosition - this.clickedFigureYPosition;

    // 커서가 해당 영역을 벗어나는 경우, 벗어나지 않도록 값을 고정한다.
    if (newXPosition + this.selectedFigure!.state.width >= currentTarget.width) {
      newXPosition = currentTarget.width - this.selectedFigure!.state.width - 5; // 이격을 두기 위해 5px 정도 줄인다.
    } else if (newXPosition <= 0) {
      newXPosition = 5;
    }

    // 커서가 해당 영역을 벗어나는 경우, 벗어나지 않도록 값을 고정한다.
    if (newYPosition + this.selectedFigure!.state.height >= currentTarget.height) {
      newYPosition = currentTarget.height - this.selectedFigure!.state.height + this.figureAreaHeight - 5;
    } else if (newYPosition <= 0) {
      newYPosition = 25 + 5;
    }

    this.selectedFigure!.updatePosition(newXPosition, newYPosition);
  }

  /**
   * 선택된 figure가 있는 경우 선택을 해제한다.
   */
  private clearSelection(): void {
    if (this.selectedFigure) {
      this.selectedFigure.updateClassName(this.selectedFigure.props.className);
      this.selectedFigure = null;
      this.clickedFigureXPosition = 0;
      this.clickedFigureYPosition = 0;
    }
  }

  private setDataToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.addedItems));
  }

  render(): React.ReactNode {
    return (
      <div className='canvas'>
        <div className='figure-wrapper'>
          <div className='button-area'>
            <button type='button' onClick={(): void => this.figureTypeButtonOnClick('circle')}>Circle</button>
            <button type='button' onClick={(): void => this.figureTypeButtonOnClick('rectangle')}>Rectangle</button>
            <button type='button' onClick={(): void => this.changeIndexButtonOnClick(true)}>Up</button>
            <button type='button' onClick={(): void => this.changeIndexButtonOnClick()}>Down</button>
            <button type='button' onClick={this.removeSelectedFigureButtonOnClick}>Remove</button>
            <button type='button' onClick={this.removeAllButtonOnClick}>Remove All</button>
            <button type='button' onClick={this.removeSelectionButtonOnClick}>Remove Selection</button>
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