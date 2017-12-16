import { NgModule } from '@angular/core';
import {
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule
} from '@angular/material';

@NgModule({
    exports: [
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatTableModule
    ]
})
export class AngularMaterialModule { }
