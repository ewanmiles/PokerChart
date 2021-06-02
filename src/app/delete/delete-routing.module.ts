import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeletePage } from './delete.page';

const routes: Routes = [
  {
    path: '',
    component: DeletePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeletePageRoutingModule {}
