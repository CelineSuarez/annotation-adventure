import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'

@Component({
  selector: 'app-image-canvas',
  templateUrl: './image-canvas.component.html',
  styleUrls: ['./image-canvas.component.scss'],
  providers: [CanvasRenderingContext2D]
})
export class ImageCanvasComponent implements OnInit {
  @ViewChild('canvasImg', {static: true}) canvasImg: ElementRef<HTMLCanvasElement>;  
  private ctx: CanvasRenderingContext2D;

  constructor() { }

  ngOnInit(): void {
    const canvasEl: HTMLCanvasElement = this.canvasImg.nativeElement;
    this.ctx = canvasEl.getContext('2d');
    
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#FFFF4F';
    this.captureEvents(canvasEl);
  }

  drawOnCanvasFreeForm(previousPosition, currentPosition){
    if (!this.ctx) { return; }

    this.ctx.beginPath();

    if (previousPosition) {
      this.ctx.moveTo(previousPosition.x, previousPosition.y); // from
      this.ctx.lineTo(currentPosition.x, currentPosition.y);
      this.ctx.stroke();
    }
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              // we'll stop (and unsubscribe) once the user releases the mouse
              // this will trigger a 'mouseup' event    
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              // pairwise lets us get the previous value to draw a line from
              // the previous point to the current point    
              pairwise()
            )
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();
  
        // previous and current position with the offset
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };
  
        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };
  
        // this method we'll implement soon to do the actual drawing
        this.drawOnCanvasFreeForm(prevPos, currentPos);
      });
  }

  animateCanvas(): void {
    this.ctx.fillStyle = 'red';  
    // const square = new Square(this.ctx);  
    // square.draw(5, 1, 20);  
    
  }

}

// export class Square {
//   constructor(private ctx: CanvasRenderingContext2D) {}

//   draw(x: number, y: number, z: number) {
//     this.ctx.fillRect(z * x, z * y, z, z);
//   }
// }
