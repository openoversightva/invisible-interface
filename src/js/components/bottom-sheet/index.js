import React, { Component, PropTypes } from 'react';
import { Motion, spring } from 'react-motion';
import { assign } from 'lodash';

import ReportContainer from 'containers/bottom-sheet/report';
import FAQFull from 'components/landing-page/faq-section/faq-full';
import { overlayStyle, sheetStyle } from './bottom-sheet.style';
import { REPORT_TYPE, FAQ_TYPE } from 'actions/bottom-sheet';
import { defaultConfig } from 'utils/spring-presets';


export default class BottomSheet extends Component {
  constructor(props) {
    super(props);
    this.contentMap = {
      [REPORT_TYPE]: ReportContainer,
      [FAQ_TYPE]: FAQFull
    };
    this.childHeight = {
      [REPORT_TYPE]: -707,
      [FAQ_TYPE]: -707
    };
  }

  componentWillReceiveProps(nextProps) {
    this.prevContent = this.props.content;
  }

  getContent() {
    if (this.props.content === null) {
      return this.prevContent;
    }
    return this.props.content;
  }

  renderOverlay(style={}) {
    return (
      <div
        className='bottom-sheet__overlay'
        onClick={ this.props.onClose }
        style={ assign({}, overlayStyle, style) }/>
    );
  }

  renderOverlayAnimation() {
    const { open } = this.props;
    const defaultStyle = { opacity: open ? .8 : 0 };
    const motionStyle = {
      opacity: spring( open ? .8 : 0, defaultConfig())
    };


    return (
      <Motion
        defaultStyle={ defaultStyle }
        style={ motionStyle }>
        { ({ opacity }) => {
          if (opacity === 0 && !open) {
            return null;
          }
          return this.renderOverlay({ opacity });
        } }
      </Motion>
    );
  }

  renderContent() {
    const content = this.getContent();

    if (content) {
      const contentClass = this.contentMap[content.type];
      if (contentClass) {
        return React.createElement(
          contentClass,
          assign({}, content.props, {
            turnOffSectionEditMode: this.props.onClose,
            sectionEditModeOn: this.context.editModeOn
          })
        );
      }
    }
    return null;
  }

  renderBottomSheet(style={}) {
    return (
      <div style={ assign({}, sheetStyle, style) }>
        { this.renderContent() }
      </div>
    );
  }

  renderBottomSheetAnimation() {
    const { open } = this.props;
    const content = this.getContent();
    const height = content ? this.childHeight[content.type] : -1000;

    return (
      <Motion
        defaultStyle={ { bottom: open ? 0 : height } }
        style={ { bottom: spring(open ? 0 : height, defaultConfig()) } }>
        { ({ bottom }) => {
          if (bottom === height && !open) {
            return null;
          }
          return this.renderBottomSheet({ bottom: `${bottom}px` });
        } }
      </Motion>
    );
  }

  render() {
    return (
      <div>
        { this.renderOverlayAnimation() }
        { this.renderBottomSheetAnimation() }
      </div>
    );
  }
}

BottomSheet.propTypes = {
  open: PropTypes.bool,
  content: PropTypes.shape({
    type: PropTypes.string,
    props: PropTypes.object
  }),
  onClose: PropTypes.func
};

BottomSheet.contextTypes = {
  editModeOn: PropTypes.bool
};
