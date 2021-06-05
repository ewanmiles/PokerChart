import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HelpPageRoutingModule } from './help-routing.module';

import { HelpPage } from './help.page';
import { HelpQuestionComponent } from '../components/help-question/help-question.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HelpPageRoutingModule
  ],
  declarations: [HelpPage, HelpQuestionComponent]
})
export class HelpPageModule {}
