import React from 'react';
import { spy } from 'sinon';
import {
  renderIntoDocument, scryRenderedComponentsWithType, findRenderedComponentWithType
} from 'react-addons-test-utils';

import CRPage from 'components/cr-page';
import StickyHeader from 'components/common/sticky-header';
import Header from 'components/cr-page/header';
import OfficerRow from 'components/cr-page/officer-row';
import MultiRow from 'components/cr-page/multi-row';
import FindingRow from 'components/cr-page/finding-row';
import Row from 'components/cr-page/row';
import { unmountComponentSuppressError, reRender } from 'utils/test';


describe('CRPage component', function () {
  let instance;

  afterEach(function () {
    unmountComponentSuppressError(instance);
  });

  it('should render header, officer, complainants, final finding, recommended outcome and final outcome', function () {
    instance = renderIntoDocument(<CRPage coaccused={ [{ id: 1, fullName: 'Foo' }] }/>);

    scryRenderedComponentsWithType(instance, StickyHeader).should.have.length(1);
    scryRenderedComponentsWithType(instance, OfficerRow).should.have.length(1);
    scryRenderedComponentsWithType(instance, MultiRow).should.have.length(1);
    scryRenderedComponentsWithType(instance, FindingRow).should.have.length(1);
    scryRenderedComponentsWithType(instance, Row).should.have.length(2);
  });

  it('should trigger fetchCR on initial', function () {
    const fetchCR = spy();
    instance = renderIntoDocument(<CRPage fetchCR={ fetchCR } crid={ '123' } />);

    fetchCR.calledWith('123').should.be.true();
  });

  it('should reset displayCoaccusedDropdown on rerender', function () {
    instance = renderIntoDocument(<CRPage officerId={ 1 } />);
    instance.setState({ displayCoaccusedDropdown: true });

    instance = reRender(<CRPage officerId={ 2 } fetchCR={ spy } />, instance);
    instance.state.displayCoaccusedDropdown.should.be.false();
  });

  it('should handle toggle coaccused dropdown', function () {
    instance = renderIntoDocument(<CRPage />);
    instance.state.displayCoaccusedDropdown.should.be.false();

    const header = findRenderedComponentWithType(instance, Header);
    header.props.onDropDownButtonClick();
    instance.state.displayCoaccusedDropdown.should.be.true();
  });
});
