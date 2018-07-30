import { spy, stub } from 'sinon';
import { browserHistory } from 'react-router';

import { navigateToSearchItem } from 'utils/navigate-to-search-item';
import * as trackingUtils from 'utils/tracking';



describe('navigate to search item utils', function () {
  describe('navigateToSearchItem', function () {
    it('should call history push if to property is defined', function () {
      const beforeHookSpy = spy();
      spy(browserHistory, 'push');

      navigateToSearchItem({ to: 'to' }, beforeHookSpy);

      browserHistory.push.calledWith('to').should.be.true();
      beforeHookSpy.called.should.be.true();

      browserHistory.push.restore();
    });

    it('should call trackOutboundLink if item has url', function () {
      const trackOutboundLinkStub = stub(trackingUtils, 'trackOutboundLink');
      const beforeHookSpy = spy();

      navigateToSearchItem({ url: 'some/url' }, beforeHookSpy);

      trackOutboundLinkStub.should.be.calledWith('some/url', '_blank');

      trackOutboundLinkStub.restore();
    });
  });
});
