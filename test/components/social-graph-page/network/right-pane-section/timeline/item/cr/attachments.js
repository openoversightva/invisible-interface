import React from 'react';
import { shallow, mount } from 'enzyme';
import { stub } from 'sinon';

import * as GATracking from 'utils/google_analytics_tracking';
import Attachments from 'components/social-graph-page/network/right-pane-section/timeline/item/cr/attachments';


describe('Attachments component', function () {
  const attachments = [{
    url: 'https://www.documentcloud.org/documents/3108232-CRID-1071970-OCIR-1-of-3.pdf',
    previewImageUrl: 'https://assets.documentcloud.org/documents/3518954/pages/CRID-299780-CR-p1-normal.gif',
    fileType: 'document',
  }, {
    url: 'https://www.documentcloud.org/documents/3108232-CRID-1071970-OCIR-2-of-3.pdf',
    previewImageUrl: 'https://assets.documentcloud.org/documents/3518954/pages/CRID-299780-CR-p2-normal.gif',
    fileType: 'document',
  }, {
    url: 'https://www.documentcloud.org/documents/3108232-CRID-1071970-OCIR-3-of-3.pdf',
    previewImageUrl: 'https://assets.documentcloud.org/documents/3518954/pages/CRID-299780-CR-p3-normal.gif',
    fileType: 'document',
  }];

  it('should render attachments correctly', function () {
    const wrapper = shallow(<Attachments attachments={ attachments } />);
    const attachmentImage = wrapper.find('.image');
    attachmentImage.prop('style').backgroundImage.should.eql(
      'url(https://assets.documentcloud.org/documents/3518954/pages/CRID-299780-CR-p1-normal.gif)'
    );
    wrapper.find('.document').should.have.length(1);
  });

  it('should render file types of attachments correctly', function () {
    const videoAttachments = [{
      url: 'https://player.vimeo.com/video/165206078',
      previewImageUrl: '/src/img/ic-video.svg',
      fileType: 'video',
    }];
    const wrapper = shallow(<Attachments attachments={ videoAttachments } />);
    wrapper.find('.image-document').exists().should.be.false();
  });

  it('should open new attachment file tab when click on attachment', function () {
    const stubOpen = stub(window, 'open');
    const wrapper = mount(<Attachments attachments={ attachments }/>);
    const attachmentImage = wrapper.find('.image');
    attachmentImage.simulate('click', { preventDefault() {} });
    stubOpen.calledWith(
      'https://www.documentcloud.org/documents/3108232-CRID-1071970-OCIR-1-of-3.pdf'
    ).should.be.true();
    stubOpen.restore();
  });

  it('should render null when there are no attachments', function () {
    const wrapper = shallow(<Attachments attachments={ [] } />);
    wrapper.find('..test-wrapper').exists().should.be.false();
  });

  it('should track click event', function () {
    const stubTrackAttachmentClick = stub(GATracking, 'trackAttachmentClick');
    const attachments = [{
      url: 'https://www.documentcloud.org/documents/3108232-CRID-1071970-OCIR-1-of-3.html',
      previewImageUrl: 'https://assets.documentcloud.org/documents/3518954/pages/CRID-299780-CR-p1-normal.gif',
      fileType: 'document',
    }];
    const wrapper = mount(
      <Attachments
        attachments={ attachments }
        pathname='/officer/123456/john-henry/'
      />
    );
    const attachmentImage = wrapper.find('.image');
    attachmentImage.simulate('click');
    stubTrackAttachmentClick.should.be.calledWith(
      '/officer/123456/john-henry/',
      'https://www.documentcloud.org/documents/3108232-CRID-1071970-OCIR-1-of-3.html'
    );
    stubTrackAttachmentClick.restore();
  });

  it('should track click on attachment event', function () {
    const stubOnTrackingAttachment = stub();
    const attachments = [{
      url: 'https://www.documentcloud.org/documents/3108232-CRID-1071970-OCIR-1-of-3.html',
      previewImageUrl: 'https://assets.documentcloud.org/documents/3518954/pages/CRID-299780-CR-p1-normal.gif',
      fileType: 'document',
      id: '123456',
    }];
    const wrapper = mount(<Attachments
      attachments={ attachments }
      pathname='/officer/123456/john-henry/'
      onTrackingAttachment={ stubOnTrackingAttachment }
    />);
    const attachmentImage = wrapper.find('.image');
    attachmentImage.simulate('click');
    stubOnTrackingAttachment.should.be.calledWith({
      attachmentId: '123456',
      sourcePage: 'Social Graph Page - Timeline Tab',
      app: 'Frontend',
    });
  });
});
