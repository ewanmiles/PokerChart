import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeletePageRoutingModule } from './delete-routing.module';

import { DeletePage } from './delete.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeletePageRoutingModule
  ],
  declarations: [DeletePage]
})
export class DeletePageModule {}
