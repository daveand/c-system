import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { TracerComponent } from './tracer/tracer.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot([
    { path: '', component: TracerComponent },
    { path: 'tracer', component: TracerComponent },
  ])],
  exports: [RouterModule]
})
export class AppRoutingModule { }
