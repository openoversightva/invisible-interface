import React from 'react';

import CollaborateSection from 'components/landing-page/collaborate-section';


describe('CollaborateSection component', function () {
  it('should be renderable', function () {
    CollaborateSection.should.be.renderable();
    CollaborateSection.should.be.responsiveRenderable();
  });
});
