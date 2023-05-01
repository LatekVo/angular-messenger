import { PersonNameOrSurnamePipe } from './person-name-or-surname.pipe';

describe('PersonNameOrSurnamePipe', () => {
  it('create an instance', () => {
    const pipe = new PersonNameOrSurnamePipe();
    expect(pipe).toBeTruthy();
  });
});
