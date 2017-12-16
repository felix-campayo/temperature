import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fahrToCent'
})
export class FahrToCentPipe implements PipeTransform {
    transform(fahrenheit: number): number {
        let response: number;

        if (fahrenheit !== undefined) {
            response = ((fahrenheit - 32) / 1.8);
        }

        return response;
    }
}
