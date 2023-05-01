import { Pipe, PipeTransform } from '@angular/core';
import { PersonModel } from "../models/personModel";

@Pipe({
  name: 'personNameOrSurname',
  pure: false // setting pure to false enables the pipe to re-run on every change detection cycle
})
export class PersonNameOrSurnamePipe implements PipeTransform {
  transform(peopleSet: PersonModel[], searchText: string): PersonModel[] {
    if (!peopleSet || !searchText) {
      return peopleSet;
    }

    searchText = searchText.toLowerCase();
    return peopleSet.filter(person =>
      person.firstName.toLowerCase().includes(searchText) ||
      person.lastName.toLowerCase().includes(searchText)
    );
  }
}
