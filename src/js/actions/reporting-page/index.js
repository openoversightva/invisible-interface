import { get, authenticatedPatch, authenticatedPost } from 'actions/common/async-action';
import { V2_ROOT_PATH } from 'utils/axios-client';


export const REPORTS_REQUEST_START = 'REPORTS_REQUEST_START';
export const REPORTS_REQUEST_SUCCESS = 'REPORTS_REQUEST_SUCCESS';
export const REPORTS_REQUEST_FAILURE = 'REPORTS_REQUEST_FAILURE';

export const REPORTS_API_URL = `${V2_ROOT_PATH}reports/`;

export const requestReports = get(
  REPORTS_API_URL,
  [REPORTS_REQUEST_START, REPORTS_REQUEST_SUCCESS, REPORTS_REQUEST_FAILURE]
);

export const ADD_REPORT_REQUEST_START = 'ADD_REPORT_REQUEST_START';
export const ADD_REPORT_REQUEST_SUCCESS = 'ADD_REPORT_REQUEST_SUCCESS';
export const ADD_REPORT_REQUEST_FAILURE = 'ADD_REPORT_REQUEST_FAILURE';

export const addReport = authenticatedPost(
  REPORTS_API_URL, [ADD_REPORT_REQUEST_START, ADD_REPORT_REQUEST_SUCCESS, ADD_REPORT_REQUEST_FAILURE]
);

export const UPDATE_REPORT_REQUEST_START = 'UPDATE_REPORT_REQUEST_START';
export const UPDATE_REPORT_REQUEST_SUCCESS = 'UPDATE_REPORT_REQUEST_SUCCESS';
export const UPDATE_REPORT_REQUEST_FAILURE = 'UPDATE_REPORT_REQUEST_FAILURE';

export const updateReport = (id, data) => (authenticatedPatch(
  `${REPORTS_API_URL}${id}/`,
  [UPDATE_REPORT_REQUEST_START, UPDATE_REPORT_REQUEST_SUCCESS, UPDATE_REPORT_REQUEST_FAILURE]
  )(data)
);
