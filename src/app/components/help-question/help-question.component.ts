import { Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';

@Component({
  selector: 'app-help-question',
  templateUrl: './help-question.component.html',
  styleUrls: ['./help-question.component.scss'],
})
export class HelpQuestionComponent implements OnInit {
  @ViewChild('show', { read: ElementRef }) showButton: ElementRef;
  @ViewChild('hide', { read: ElementRef }) hideButton: ElementRef;
  @ViewChild('answer', { read: ElementRef }) answer: ElementRef;
  @Input() question: any;

  constructor() { }

  ngOnInit() {}

  showQuestion() {
    this.showButton.nativeElement.style.display = "none";
    this.hideButton.nativeElement.style.display = "flex";

    this.answer.nativeElement.style.display = "flex";
  }

  hideQuestion() {
    this.hideButton.nativeElement.style.display = "none";
    this.showButton.nativeElement.style.display = "flex";

    this.answer.nativeElement.style.display = "none";
  }
}
