import axiosMockClient, { countRequests } from 'utils/axios-mock-client';
import {
  ACTIVITY_GRID_API_URL,
  CITY_SUMMARY_API_URL,
  CR_URL,
  LANDING_PAGE_API_URL,
  MAIL_CHIMP_URL,
  OFFICER_URL,
  OFFICERS_BY_ALLEGATION_API_URL,
  RECENT_COMPLAINT_SUMMARIES_URL,
  RECENT_DOCUMENT_URL,
  RESET_PASSWORD_URL,
  SEARCH_TERMS_CATEGORIES_API_URL,
  SIGNIN_URL,
  UNIT_PROFILE_URL
} from 'utils/constants';
import { communityGeoJSONPath } from 'utils/static-assets';
import getCRData from './cr-page/get-data';
import getCRDataNoAttachment from './cr-page/get-data-no-attachment';
import getCRRelatedComplaintsData from './cr-page/get-related-complaint';
import getActivityGridData from './landing-page/activity-grid';
import { getCMSFields } from './landing-page/cms-field';
import getComplaintSummaries from './landing-page/complaint-summaries';
import { getCitySummary, getCommunities } from './landing-page/heat-map';
import getRecentDocument from './landing-page/recent-document';
import { groupedSuggestions, singleGroupSuggestions } from './landing-page/suggestions';
import getCoaccusalsData from './officer-page/get-coaccusals';
import getNewTimelineItemsData from './officer-page/get-new-timeline-item';
import getSocialGraphData from './officer-page/get-social-graph';
import getSummaryData from './officer-page/get-summary';

import getSearchTermsData from './search-terms-page';
import getUnitSummaryData from './unit-profile-page/get-summary';


const SEARCH_API_URL = /^suggestion\/([^/]*)\/$/;
const SEARCH_SINGLE_API_URL = /^suggestion\/([^/]*)\/single\/$/;
/* istanbul ignore next */

axiosMockClient.onGet(ACTIVITY_GRID_API_URL).reply(() => [200, getActivityGridData()]);
axiosMockClient.onGet(OFFICERS_BY_ALLEGATION_API_URL).reply(() => [200, getActivityGridData(48)]);
axiosMockClient.onGet(RECENT_DOCUMENT_URL).reply(() => [200, getRecentDocument(24)]);
axiosMockClient.onGet(RECENT_COMPLAINT_SUMMARIES_URL).reply(() => [200, getComplaintSummaries(20)]);

axiosMockClient.onPost(SIGNIN_URL, { username: 'username', password: 'password' })
  .reply(200, { 'apiAccessToken': '055a5575c1832e9123cd546fe0cfdc8607f8680c' });
axiosMockClient.onPost(SIGNIN_URL, { username: 'badname', password: 'badpassword' })
  .reply(400, { 'message': 'Bad username/password' });

axiosMockClient.onPost(RESET_PASSWORD_URL, { email: 'valid@email.com' })
  .reply(200, { 'message': 'Please check your email for a password reset link.' });
axiosMockClient.onPost(RESET_PASSWORD_URL, { email: 'invalid@email.com' })
  .reply(400, { 'message': 'Sorry, there\'s no account registered with this email address.' });

axiosMockClient.onPost(`${CR_URL}1000000/request-document/`, { email: 'valid@email.com' })
  .reply(200, { 'message': 'Thanks for subscribing.', crid: 1000000 });
axiosMockClient.onPost(`${CR_URL}1000000/request-document/`, { email: 'invalid@email.com' })
  .reply(400, { 'message': 'Sorry, we can not subscribe your email' });


// remove "/" from beginning of any v1 path for axios mock adapter to work.
let mailChimpUrl = MAIL_CHIMP_URL.slice(1);
axiosMockClient.onPost(mailChimpUrl, { email: 'valid@email.com' }).reply(200, { 'success': true });
axiosMockClient.onPost(mailChimpUrl, { email: 'invalid@email.com' })
  .reply(400, {
    'detail': 'invalid@email.com looks fake or invalid, please enter a real email address.', 'success': false
  });

axiosMockClient.onGet(SEARCH_SINGLE_API_URL, { params: { contentType: 'OFFICER' } }).reply(() => {
  return [200, singleGroupSuggestions.default];
});
axiosMockClient.onGet(SEARCH_SINGLE_API_URL, { params: { contentType: 'NEIGHBORHOOD' } }).reply(() => {
  return [200, singleGroupSuggestions.neighborhoods];
});
axiosMockClient.onGet(SEARCH_SINGLE_API_URL, { params: { contentType: 'OFFICER', offset: '20' } }).reply(() => {
  return [200, singleGroupSuggestions.offset20];
});

axiosMockClient.onGet(SEARCH_API_URL).reply(function (config) {
  const matchs = SEARCH_API_URL.exec(config.url);
  return [200, groupedSuggestions[config.params.contentType || matchs[1]] || groupedSuggestions['default']];
});

axiosMockClient.onGet(`${OFFICER_URL}1/summary/`).reply(countRequests(() => [200, getSummaryData()]));
axiosMockClient.onGet(`${OFFICER_URL}1/social-graph/`).reply(countRequests(() => [200, getSocialGraphData()]));

axiosMockClient.onGet(`${CR_URL}1000000/`).reply(200, getCRData());
axiosMockClient.onGet(`${CR_URL}2/`).reply(200, getCRDataNoAttachment());
axiosMockClient.onGet(
  `${CR_URL}1000000/related-complaints/?match=categories&distance=0.5mi`
).reply(200, getCRRelatedComplaintsData({ match: 'categories', distance: '0.5mi' }));

axiosMockClient.onGet(
  `${CR_URL}1000000/related-complaints/?match=categories&distance=0.5mi&offset=20`
).reply(200, getCRRelatedComplaintsData({ match: 'categories', distance: '0.5mi', nextOffset: 40 }));

axiosMockClient.onGet(`${OFFICER_URL}1/new-timeline-items/`).reply(200, getNewTimelineItemsData());
axiosMockClient.onGet(`${OFFICER_URL}1/coaccusals/`).reply(200, getCoaccusalsData());

axiosMockClient.onGet(`${UNIT_PROFILE_URL}001/summary/`).reply(200, getUnitSummaryData());

axiosMockClient.onGet(SEARCH_TERMS_CATEGORIES_API_URL).reply(200, getSearchTermsData());

axiosMockClient.onGet(CITY_SUMMARY_API_URL).reply(200, getCitySummary());
axiosMockClient.onGet(communityGeoJSONPath).reply(200, getCommunities());

axiosMockClient.onGet(LANDING_PAGE_API_URL).reply(200, getCMSFields());

/*istanbul ignore next*/
export function getMockAdapter() {
  if (global.LIVE_TEST !== undefined) {
    return axiosMockClient.adapter();
  }
  return null;
}
