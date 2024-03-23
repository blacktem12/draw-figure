import type React from 'react';
import type Figure from '../Figure';

export type FigureProps = {
  id: number;
  ref: React.RefObject<Figure>;
  onMouseDown(e: React.MouseEvent, instance: Figure): void;
} & FigureState;

export type FigureState = {
  className: 'circle'|'rectangle'|'circle selected'|'rectangle selected';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};