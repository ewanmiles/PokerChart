import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JoinPage } from './join.page';

const routes: Routes = [
  {
    path: '',
    component: JoinPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JoinPageRoutingModule {}
