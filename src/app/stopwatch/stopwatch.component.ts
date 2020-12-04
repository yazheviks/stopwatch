import { Component, OnInit } from '@angular/core';
import { timer, Subscription, of, Subject } from 'rxjs';
import { delay, timeInterval, filter } from 'rxjs/operators';
import { timeState, TimeState } from '../../helpers/TimeState';

@Component({
  selector: 'app-stopwatch',
  templateUrl: './stopwatch.component.html',
  styleUrls: ['./stopwatch.component.scss']
})
export class StopwatchComponent implements OnInit  {
  isStarted:boolean = false;
  state = { ...timeState };
  doubleClickDifference = 300;
  timeRunning: Subscription = new Subscription;
  result: TimeState | null = null;
  $click = new Subject();

  ngOnInit() {
    this.$click
      .pipe(
        timeInterval(),
        filter(interval => interval.interval < this.doubleClickDifference)
      )
      .subscribe(() => {
        this.isStarted = false;
        this.timeRunning.unsubscribe();
      })
  }

  renderNewTime(time: number) {
    switch(this.isStarted) {
      case time < 60:
        this.state.second = this.state.time;
        break;
      case time < 3600:
        this.state.minute = Math.floor(time / 60);
        this.state.second = Math.floor(time % 60);
        break;
      default:
        this.state.hour = Math.floor(time / 3600);
        this.state.minute = Math.floor(time % 3600 / 60);
        this.state.second = Math.floor(time % 3600 % 60);
    }
  }

  start(): void {
    this.timeRunning = timer(1000, 1000).subscribe(() => {
      this.state.time++;

      this.renderNewTime(this.state.time);
    });
  }

  finish(): void {
    this.timeRunning.unsubscribe();
    this.result = { ...this.state };

    of(true)
      .pipe(delay(3000))
      .subscribe(() => {
        this.result = null;
      });

    this.reset();
  }

  toggleWork(): void {
    this.isStarted = !this.isStarted;

    if (!this.isStarted) {
      this.finish();
      return;
    }

    this.start();
  }

  wait(): void {
    if (!this.isStarted) {
      return;
    }

    this.$click.next();
  }

  reset(): void {
    if (!this.state.time) {
      return;
    }

    this.state = { ...timeState };
  }
}
