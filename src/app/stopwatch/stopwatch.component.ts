import { Component } from '@angular/core';
import { timer, fromEvent, Subscription, of } from 'rxjs';
import { delay, timeInterval } from 'rxjs/operators';

@Component({
  selector: 'app-stopwatch',
  templateUrl: './stopwatch.component.html',
  styleUrls: ['./stopwatch.component.scss']
})
export class StopwatchComponent  {
  isStarted:boolean = false;
  initialState = {
    time: 0,
    hour: 0,
    minute: 0,
    second: 0,
  };
  state = { ...this.initialState };
  doubleClickDifference = 300;
  a: Subscription = new Subscription;
  result: any = null;

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
    this.a = timer(1000, 1000).subscribe(() => {
      this.state.time++;

      this.renderNewTime(this.state.time);
    });
  }

  finish(): void {
    this.a.unsubscribe();
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

  wait(event: any): void {
    if (!this.isStarted) {
      return;
    }

    fromEvent(event.target, 'click')
      .pipe(timeInterval())
      .subscribe(iteration => {
        if (iteration.interval < this.doubleClickDifference) {
          this.isStarted = false;
          this.a.unsubscribe();
        }
    });
  }

  reset(): void {
    if (!this.state.time) {
      return;
    }

    this.state = { ...this.initialState };
  }
}
