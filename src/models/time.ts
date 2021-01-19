import { Direction } from '../types';
import { Hour } from './hour';
export class Time {
  constructor(public hour: Hour) {}

  hourStep(direction: Direction): void {
    this.hour.stepUpdate(direction);
  }

  get value(): string {
    return `${this.hour.value}`;
  }
}
