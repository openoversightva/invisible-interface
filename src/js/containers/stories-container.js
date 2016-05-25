import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';

import { featuredStorySelector, dataAvailableSelector, smallStoriesSelector } from 'selectors/stories-selector';
import Stories from 'components/stories/stories';
import { requestStories } from 'actions/story-app';
import { openBottomSheet } from 'actions/bottom-sheet';
import StoriesPlaceHolder from 'components/stories/stories-place-holder';


export class StoriesContainer extends Component {
  componentDidMount() {
    this.props.requestStories();
  }

  render() {
    const { dataAvailable, smallStories, featuredStory } = this.props;

    return (
      !dataAvailable ?
        <StoriesPlaceHolder/> :
        <Stories
          smallStories={ smallStories } featuredStory={ featuredStory }
          onStoryClick={ this.props.openBottomSheet }/>
    );
  }
}

StoriesContainer.propTypes = {
  requestStories: PropTypes.func.isRequired,
  openBottomSheet: PropTypes.func.isRequired,
  dataAvailable: PropTypes.bool,
  smallStories: PropTypes.array,
  featuredStory: PropTypes.object
};

function mapStateToProps(state, ownProps) {
  return {
    dataAvailable: dataAvailableSelector(state),
    smallStories: smallStoriesSelector(state),
    featuredStory: featuredStorySelector(state)
  };
}

const mapDispatchToProps = {
  requestStories,
  openBottomSheet
};

export default connect(mapStateToProps, mapDispatchToProps)(StoriesContainer);
