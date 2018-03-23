import { flush, render } from '@stencil/core/testing';
import { Asset } from './asset';

describe('techomaha-asset', () => {
  it('should build', () => {
    expect(new Asset()).toBeTruthy();
  });

  describe('rendering', () => {
    let element;
    beforeEach(async () => {
      element = await render({
        components: [Asset],
        html: '<techomaha-asset></techomaha-asset>'
      });
    });

    it('should work without parameters', () => {
      expect(true).toEqual(true);
    });
  });
});
