import 'should';
import React from 'react';

import ResponsiveComponent from 'components/responsive-component';
import 'utils/test/React';


describe('ResponsiveComponent component', function () {
  it('should render in all screen size', function () {
    ResponsiveComponent.should.be.renderable();
    ResponsiveComponent.should.be.responsiveRenderable();
  });
});
