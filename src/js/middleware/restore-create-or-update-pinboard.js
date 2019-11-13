import { Promise } from 'es6-promise';
import * as _ from 'lodash';
import pluralize from 'pluralize';
import { browserHistory } from 'react-router';

import {
  ADD_OR_REMOVE_ITEM_IN_PINBOARD,
  REMOVE_ITEM_IN_PINBOARD_PAGE,
  ADD_ITEM_IN_PINBOARD_PAGE,
  ORDER_PINBOARD,
  SAVE_PINBOARD,
  UPDATE_PINBOARD_INFO,
  PINBOARD_ITEM_REMOVE_MODE,
  SAVE_PINBOARD_WITHOUT_CHANGING_STATE,
} from 'utils/constants';
import {
  createPinboard,
  updatePinboard,
  addItemToPinboardState,
  removeItemFromPinboardState,
  orderPinboardState,
  updatePinboardInfoState,
  savePinboard,
  savePinboardWithoutChangingState,
  performFetchPinboardRelatedData,
  handleRemovingItemInPinboardPage,
  fetchLatestRetrievedPinboard,
  setPinboardHasPendingChanges,
} from 'actions/pinboard';
import { Toastify } from 'utils/vendors';
import { dispatchFetchPinboardPageData, dispatchFetchPinboardPinnedItems, isEmptyPinboard } from 'utils/pinboard';
import pinboardStyles from 'components/pinboard-page/pinboard-page.sass';
import { isPinboardRestoredSelector } from 'selectors/pinboard-page/pinboard';
import { generatePinboardUrl } from 'utils/pinboard';


const getIds = (query, key) => _.get(query, key, '').split(',').filter(_.identity);
const isParam = (param, validators) => validators.includes(_.toLower(_.camelCase(param)));

const getPinboardFromQuery = (query) => {
  const invalidParams = [];
  const pinboardFromQuery = {
    officerIds: [],
    crids: [],
    trrIds: [],
  };
  _.keys(query).forEach(param => {
    if (isParam(param, ['officerid', 'officerids'])) {
      pinboardFromQuery.officerIds = getIds(query, param).map(id => parseInt(id));
    } else if (isParam(param, ['crid', 'crids'])) {
      pinboardFromQuery.crids = getIds(query, param);
    } else if (isParam(param, ['trrid', 'trrids'])) {
      pinboardFromQuery.trrIds = getIds(query, param).map(id => parseInt(id));
    } else {
      invalidParams.push(param);
    }
  });
  return { pinboardFromQuery, invalidParams };
};

const getRequestPinboard = (state, pinboard=undefined) => {
  if (pinboard === undefined) {
    pinboard = state.pinboardPage.pinboard;
  }

  const removingItems = {
    officerItems: _.get(state, 'pinboardPage.officerItems.removingItems', []),
    crItems: _.get(state, 'pinboardPage.crItems.removingItems', []),
    trrItems: _.get(state, 'pinboardPage.trrItems.removingItems', []),
  };

  const transformPinboard = {
    id: _.get(pinboard, 'id', null),
    title: _.get(pinboard, 'title', ''),
    officerIds: _.map(_.get(pinboard, 'officer_ids', []), id => (id.toString())),
    crids: _.get(pinboard, 'crids', []),
    trrIds: _.map(_.get(pinboard, 'trr_ids', []), id => (id.toString())),
    description: _.get(pinboard, 'description', ''),
  };

  transformPinboard.officerIds = _.filter(transformPinboard.officerIds,
    id => removingItems.officerItems.indexOf(id) === -1);
  transformPinboard.crids = _.filter(transformPinboard.crids,
    id => removingItems.crItems.indexOf(id) === -1);
  transformPinboard.trrIds = _.filter(transformPinboard.trrIds,
    id => removingItems.trrItems.indexOf(id) === -1);

  return transformPinboard;
};

const MAX_RETRIES = 60;
const RETRY_DELAY = 1000;
let retries = 0;

function dispatchUpdateOrCreatePinboard(store, currentPinboard, successCallBack=_.noop) {
  const updateOrCreatePinboard = _.isNil(currentPinboard.id) ? createPinboard : updatePinboard;
  store.dispatch(updateOrCreatePinboard(currentPinboard)).then(result => {
    retries = 0;
    store.dispatch(savePinboard(result.payload));
    successCallBack(result.payload);
  }).catch(() => {
    if (retries < MAX_RETRIES) {
      retries += 1;
      setTimeout(() => store.dispatch(savePinboard()), RETRY_DELAY);
    }
  });
}

function formatMessage(foundIds, notFoundIds, itemType) {
  let message = '';
  if (!notFoundIds.length)
    return '';

  const total = foundIds.length + notFoundIds.length;
  if (foundIds.length) {
    message += ` ${ foundIds.length } out of ${total} ${total === 1 ? itemType : `${itemType}s`} ` +
      'were added to this pinboard.';
  }
  message += ` ${ notFoundIds.length } out of ${total} ${itemType} ${total === 1 ? 'ID': 'IDs'} ` +
    `could not be recognized (${notFoundIds.join(', ')}).`;
  return message.trim();
}

const formatInvalidParamMessage = (invalidParams) =>
  `${invalidParams.join(', ')} ${pluralize('is', invalidParams.length)} not recognized.`;

const TopRightTransition = Toastify.cssTransition({
  enter: 'toast-enter',
  exit: 'toast-exit',
  duration: 500,
  appendPosition: true,
});
const showPinboardToast = (message) => Toastify.toast(message, {
  className: pinboardStyles.pinboardPageToast,
  bodyClassName: 'toast-body',
  transition: TopRightTransition,
  autoClose: false,
});

function showCreatedToasts(payload) {
  const foundOfficerIds = _.get(payload, 'officer_ids', []);
  const foundCrids = _.get(payload, 'crids', []);
  const foundTrrIds = _.get(payload, 'trr_ids', []);

  const notFoundOfficerIds = _.get(payload, 'not_found_items.officer_ids', []);
  const notFoundCrids = _.get(payload, 'not_found_items.crids', []);
  const notFoundTrrIds = _.get(payload, 'not_found_items.trr_ids', []);

  const creatingMessages = [];
  creatingMessages.push(formatMessage(foundOfficerIds, notFoundOfficerIds, 'officer'));
  creatingMessages.push(formatMessage(foundCrids, notFoundCrids, 'allegation'));
  creatingMessages.push(formatMessage(foundTrrIds, notFoundTrrIds, 'TRR'));

  creatingMessages.filter(_.identity).forEach(showPinboardToast);
}

const TOAST_TYPE_MAP = {
  'CR': 'CR',
  'DATE > CR': 'CR',
  'INVESTIGATOR > CR': 'CR',
  'OFFICER': 'Officer',
  'UNIT > OFFICERS': 'Officer',
  'DATE > OFFICERS': 'Officer',
  'TRR': 'TRR',
  'DATE > TRR': 'TRR',
};

function showAddOrRemoveItemToast(store, payload) {
  const { isPinned, type } = payload;
  const actionType = isPinned ? 'removed' : 'added';

  const state = store.getState();
  const pinboard = getRequestPinboard(state);
  const url = _.isNull(pinboard.id) ? '/pinboard/' : generatePinboardUrl(pinboard);

  Toastify.toast(`${TOAST_TYPE_MAP[type]} ${actionType}`, {
    className: `toast-wrapper ${actionType}`,
    bodyClassName: 'toast-body',
    transition: TopRightTransition,
    onClick: () => browserHistory.push(url),
  });
}

function setHasPendingChangesIfNeeded(store, hasPendingChanges) {
  const state = store.getState();
  const currentHasPendingChanges = _.get(state.pinboardPage.pinboard, 'hasPendingChanges');
  if (currentHasPendingChanges !== hasPendingChanges)
    store.dispatch(setPinboardHasPendingChanges(hasPendingChanges));
}

export default store => next => action => {
  if (action.type === ADD_OR_REMOVE_ITEM_IN_PINBOARD || action.type === ADD_ITEM_IN_PINBOARD_PAGE) {
    let promises = [];

    const addOrRemove = action.payload.isPinned ? removeItemFromPinboardState : addItemToPinboardState;
    promises.push(store.dispatch(addOrRemove(action.payload)));

    Promise.all(promises).finally(() => {
      store.dispatch(savePinboard());
      if (action.type === ADD_OR_REMOVE_ITEM_IN_PINBOARD) {
        showAddOrRemoveItemToast(store, action.payload);
      }
    });
  }

  if (action.type === REMOVE_ITEM_IN_PINBOARD_PAGE) {
    const { mode } = action.payload;
    switch (mode) {
      case PINBOARD_ITEM_REMOVE_MODE.API_ONLY:
        setHasPendingChangesIfNeeded(store, true);
        store.dispatch(handleRemovingItemInPinboardPage(action.payload));
        store.dispatch(savePinboardWithoutChangingState(action.payload));
        break;
      case PINBOARD_ITEM_REMOVE_MODE.STATE_ONLY:
        store.dispatch(removeItemFromPinboardState(action.payload));
        break;
      default:
        Promise.all([store.dispatch(removeItemFromPinboardState(action.payload))]).finally(() => {
          store.dispatch(savePinboard());
        });
        break;
    }
  }

  if (action.type === UPDATE_PINBOARD_INFO) {
    Promise.all([store.dispatch(updatePinboardInfoState(action.payload))]).finally(() => {
      store.dispatch(savePinboard());
    });
  }

  if (action.type === ORDER_PINBOARD) {
    Promise.all([store.dispatch(orderPinboardState(action.payload))]).finally(() => {
      store.dispatch(savePinboard());
    });
  }

  if (action.type === SAVE_PINBOARD_WITHOUT_CHANGING_STATE) {
    const state = store.getState();
    const pinboard = getRequestPinboard(state);

    store.dispatch(updatePinboard(pinboard)).then(result => {
      setHasPendingChangesIfNeeded(store, false);
      store.dispatch(performFetchPinboardRelatedData());
      dispatchFetchPinboardPageData(store, result.payload.id);
    });
  }

  if (action.type === SAVE_PINBOARD) {
    const state = store.getState();
    const pinboard = state.pinboardPage.pinboard;

    const currentPinboard = getRequestPinboard(state);
    const pinboardId = currentPinboard.id;

    if (!pinboard.saving) {
      const savedPinboard = getRequestPinboard(state, action.payload);

      if (_.isEmpty(action.payload) || !_.isEqual(currentPinboard, savedPinboard)) {
        setHasPendingChangesIfNeeded(store, true);

        dispatchUpdateOrCreatePinboard(store, currentPinboard);
      } else {
        setHasPendingChangesIfNeeded(store, false);

        if (_.startsWith(state.pathname, '/pinboard/') && pinboardId) {
          if (!state.pinboardPage.pinnedItemsRequested) {
            dispatchFetchPinboardPinnedItems(store, pinboardId);
          }
          if (pinboard.needRefreshData) {
            store.dispatch(performFetchPinboardRelatedData());
            dispatchFetchPinboardPageData(store, pinboardId);
          }
        }
      }
    }
  }

  if (action.type === '@@router/LOCATION_CHANGE') {
    const state = store.getState();
    const pinboard = state.pinboardPage.pinboard;
    const onPinboardPage = action.payload.pathname.match(/\/pinboard\//);
    const hasPinboardId = action.payload.pathname.match(/\/pinboard\/[a-fA-F0-9]+\//);
    if (onPinboardPage && !hasPinboardId && !pinboard.hasPendingChanges) {
      const { pinboardFromQuery, invalidParams } = getPinboardFromQuery(action.payload.query);
      _.isEmpty(invalidParams) || showPinboardToast(formatInvalidParamMessage(invalidParams));

      if (!isEmptyPinboard(pinboardFromQuery))
        dispatchUpdateOrCreatePinboard(store, pinboardFromQuery, showCreatedToasts);
      else {
        _.isEmpty(action.payload.query) || showPinboardToast('Redirected to latest pinboard.');
        store.dispatch(fetchLatestRetrievedPinboard({ create: true }));
      }
    } else if (!isPinboardRestoredSelector(state) && !onPinboardPage) {
      store.dispatch(fetchLatestRetrievedPinboard({ create: false }));
    }
  }

  return next(action);
};
