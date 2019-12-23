import PropTypes from 'prop-types';
import React from 'react';
import { Motion, spring } from 'react-motion';
import { interpolate } from 'chroma-js';

import ConfiguredRadium from 'utils/configured-radium';
import { defaultConfig } from 'utils/spring-presets';


function BackgroundColorTransition(props) {
  const { transition, style, children, colorIn, colorOut } = props;

  return (
    <Motion style={ { ratio: transition ? spring(1, defaultConfig()) : spring(0, defaultConfig()) } }>
      { ({ ratio }) =>
        <div style={ [style, { backgroundColor: interpolate(colorIn, colorOut, ratio).hex() }] }>
          { children }
        </div>
      }
    </Motion>
  );
}

BackgroundColorTransition.propTypes = {
  transition: PropTypes.bool,
  colorIn: PropTypes.string,
  colorOut: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object,
};

BackgroundColorTransition.defaultProps = {
  colorIn: 'white',
  colorOut: 'black',
  style: {},
};

export default ConfiguredRadium(BackgroundColorTransition);
