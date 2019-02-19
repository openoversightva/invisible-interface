import React, { Component, PropTypes } from 'react';
import cx from 'classnames';
import { browserHistory } from 'react-router';

import Counter from './counter';
import Toggle from './toggle';
import styles from './document-row.sass';

export default class DocumentRow extends Component {
  handleClick(id) {
    browserHistory.push(`/tracker/document/${id}/`);
  }

  render() {
    const { id, show, thumbnail, title, source, date, setDocumentShow, viewsCount, downloadsCount } = this.props;
    return (
      <div
        onClick={ this.handleClick.bind(this, id) }
        className={ cx(styles.row, { 'document-faded': !show }) }>
        <span
          className='document-thumbnail'
          style={ thumbnail ? {
            backgroundImage: `url(${thumbnail})`
          } : null }/>
        <span className={ cx('document-title', { 'document-faded': !show }) }>
          { title }
        </span>
        <span className={ cx('document-source', { 'document-faded': !show }) }>
          { source }
        </span>
        <span className={ cx('document-counts', { 'document-faded': !show }) }>
          <Counter
            viewsCount={ viewsCount }
            downloadsCount={ downloadsCount } />
        </span>
        <span className={ cx('document-date', { 'document-faded': !show }) }>
          { date }
        </span>
        <span className='document-toggle'>
          <Toggle
            on={ show }
            onChange={ visible => setDocumentShow(id, !visible) }>
            { show ? 'show' : 'hide' }
          </Toggle>
        </span>
      </div>
    );
  }
}

DocumentRow.propTypes = {
  id: PropTypes.number,
  show: PropTypes.bool,
  thumbnail: PropTypes.string,
  title: PropTypes.string,
  source: PropTypes.string,
  date: PropTypes.string,
  setDocumentShow: PropTypes.func,
  viewsCount: PropTypes.number,
  downloadsCount: PropTypes.number
};
