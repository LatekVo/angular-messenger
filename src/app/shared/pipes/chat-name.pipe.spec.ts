import { ChatNamePipe } from './chat-name.pipe';

describe('ChatNamePipe', () => {
  it('create an instance', () => {
    const pipe = new ChatNamePipe();
    expect(pipe).toBeTruthy();
  });
});
