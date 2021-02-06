import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-image-canvas',
  templateUrl: './image-canvas.component.html',
  styleUrls: ['./image-canvas.component.scss'],
  providers: [CanvasRenderingContext2D]
})
export class ImageCanvasComponent implements OnInit {
  @ViewChild('canvasImg', {static: true}) canvasImg: ElementRef<HTMLCanvasElement>;  
  private ctx: CanvasRenderingContext2D;
  image: {
    name: string,
    fileSize: string,
    imgType: string
  }
  canvasWidth = 385;
  canvasHeight = 400;
  canvasElement: HTMLCanvasElement;

  constructor() { }

  ngOnInit(): void {
    // Initialize the image object
    this.image = {
      name: 'Sample Sonogram',
      fileSize: '399kb',
      imgType: 'sonogram32wks'
    }

    this.canvasElement = this.canvasImg.nativeElement;
    this.ctx = this.canvasElement.getContext('2d');
  }

  allowDrawingOnCanvas() {
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#FFFF4F';
    const canvasElm: HTMLCanvasElement = this.canvasImg.nativeElement;
    this.captureEvents(canvasElm);
  }

  saveAnnotations(){
    // In here we would call a service to save the current image, for now we will open a new tab with the saved annotations
    this.canvasElement.toDataURL("image/png", 1.0);
    console.log(this.canvasElement.toDataURL("image/png", 1.0));
  }

  clearCanvas(){
    // This can be made more dynamic with a function that gathers file width and height on ngOnInit
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
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

  captureEvents(canvasEl: HTMLCanvasElement) {
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
          
        this.drawOnCanvasFreeForm(prevPos, currentPos);
      });
  }

}

