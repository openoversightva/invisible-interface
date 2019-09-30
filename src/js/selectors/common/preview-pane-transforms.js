import { get, sumBy, map, last, kebabCase, has, isEmpty, compact } from 'lodash';
import moment from 'moment';

import { extractPercentile } from 'selectors/common/percentile';
import { getCurrentAge, formatDate } from 'utils/date';
import { roundedPercentile } from 'utils/calculations';
import { DATE_FORMAT, FULL_MONTH_DATE_FORMAT } from 'utils/constants';
import { getDemographicString } from 'utils/victims';
import {
  navigationItemTransform as previewPaneNavigationItemTransform,
} from './navigation-item-transform';
import { baseItemTransform } from './search-item-transforms';


const mappingRace = (race) => {
  if (race.indexOf('Black') !== -1) {
    return 'Black';
  } else if (race.indexOf('Spanish') !== -1) {
    return 'Hispanic';
  } else if (race.indexOf('Native') !== -1) {
    return 'Native';
  }
  return race;
};

export const previewPaneTransform = item => {
  const { type } = item;
  const transform = get(previewPaneTransformMap, type, () => {});
  return {
    type,
    data: { ...transform(item), isPinned: get(item, 'isPinned', false) },
  };
};

const officerMostComplaintTransform = officer => {
  const percentile = extractPercentile(officer);
  return {
    id: officer.id,
    count: officer.count,
    name: officer.name,
    url: `/officer/${officer.id}/${kebabCase(officer.name)}/`,
    radarAxes: percentile.items,
    radarColor: percentile.visualTokenBackground,
  };
};

const areaTransform = (item) => {
  const population = sumBy(item['race_count'], 'count');
  const transformedOfficersMostComplaint = map(item['officers_most_complaint'], officerMostComplaintTransform);
  return {
    name: item['name'] || 'Unknown',
    allegationCount: item['allegation_count'] || 0,
    mostCommonComplaint: item['most_common_complaint'] || [],
    officersMostComplaint: transformedOfficersMostComplaint,
    population: population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    medianIncome: item['median_income'],
    url: item['url'],
    allegationPercentile: item['allegation_percentile'],
    raceCount: map(item['race_count'], (item) => {
      let result = { race: mappingRace(item.race) };
      const racePercentile = population ? item['count'] / population * 100 : 0;
      result['count'] = `${racePercentile.toFixed(1)}%`;
      return result;
    }),
    alderman: item['alderman'],
    districtCommander: item.commander ? {
      'id': item.commander['id'],
      'name': item.commander['full_name'],
      'count': item.commander['allegation_count'],
      'url': `/officer/${item.commander['id']}/${kebabCase(item.commander['full_name'])}/`,
    } : null,
    policeHQ: item['police_hq'],
  };
};

const rankTransform = item => {
  const officersMostComplaints = map(item['officers_most_complaints'], officerMostComplaintTransform);
  return {
    name: item.name,
    activeOfficersCount: item['active_officers_count'],
    officersMostComplaints,
  };
};

const accusedTransform = coaccused => {
  const percentile = extractPercentile(coaccused.percentile);
  return {
    id: coaccused.id,
    name: coaccused['full_name'],
    url: `/officer/${coaccused.id}/${kebabCase(coaccused['full_name'])}/`,
    count:
      has(coaccused, 'allegation_count') ? coaccused['allegation_count'] :
        has(coaccused, 'complaint_count') ? coaccused['complaint_count'] :
          0,
    radarAxes: percentile.items,
    radarColor: percentile.visualTokenBackground,
  };
};

const getSubText = (highlight) => {
  if (highlight) {
    const summary = highlight.summary ? highlight.summary[0] : '';
    const textContent = highlight['text_content'] ? highlight['text_content'][0] : '';
    return summary || textContent || '';
  }
  return '';
};

const crTransform = (item) => {
  const coaccused = map(item.coaccused, accusedTransform);
  return {
    subText: getSubText(item.highlight),
    coaccused,
    victims: compact(map(item.victims, getDemographicString)),
    address: item.address,
    category: item.category || item['most_common_category'],
    subCategory: item['sub_category'],
    incidentDate: formatDate(item['incident_date']),
    to: item.to,
  };
};

const trrTransform = (item) => {
  const incidentDate = !isEmpty(item['trr_datetime']) ? moment(item['trr_datetime']).format(DATE_FORMAT) : '';
  const dateText = item['trr_datetime'] ? ` - ${moment(item['trr_datetime']).format(FULL_MONTH_DATE_FORMAT)}` : '';
  const officer = item['officer'];
  const firearmUsed = item['firearm_used'];
  const taser = item['taser'];
  const category = has(item, 'category') ? item['category'] :
    firearmUsed ? 'Firearm' : taser ? 'Taser' : 'Use of Force Report';

  return {
    subText: `TRR # ${item.id}${dateText}`,
    to: item.to,
    category,
    incidentDate,
    address: item.address,
    officer: officer ? accusedTransform(officer) : null,
  };
};

export const officerTransform = (item) => {
  const race = item['race'] === 'Unknown' ? null : item['race'];
  const lastPercentile =
    has(item, 'percentile') ? item['percentile'] :
      has(item, 'percentiles') ? last(item['percentiles']) :
        {};

  return {
    id: item['id'],
    fullName: item['name'] || item['full_name'],
    appointedDate: formatDate(item['appointed_date']),
    resignationDate: formatDate(item['resignation_date']),
    badge: item['badge'],
    gender: item['gender'] || '',
    to: item['to'],
    age: getCurrentAge(item['birth_year']) || null,
    race: race || '',
    rank: item['rank'],
    unit: {
      id: get(item['unit'], 'id'),
      unitName: get(item['unit'], 'unit_name'),
      description: get(item['unit'], 'description'),
    },
    lastPercentile: extractPercentile(lastPercentile),
    complaintCount: item['allegation_count'],
    complaintPercentile: roundedPercentile(get(lastPercentile, 'percentile_allegation')),
    civilianComplimentCount: item['civilian_compliment_count'],
    sustainedCount: item['sustained_count'],
    disciplineCount: item['discipline_count'],
    trrCount: get(item, 'trr_count'),
    trrPercentile: roundedPercentile(get(lastPercentile, 'percentile_trr')),
    majorAwardCount: get(item, 'major_award_count'),
    honorableMentionCount: get(item, 'honorable_mention_count'),
    honorableMentionPercentile: roundedPercentile(get(item, 'honorable_mention_percentile')),
  };
};

const previewPaneTransformMap = {
  'SEARCH-TERMS': previewPaneNavigationItemTransform,
  'DATE > CR': crTransform,
  'DATE > TRR': trrTransform,
  'DATE > OFFICERS': officerTransform,
  'UNIT > OFFICERS': officerTransform,
  OFFICER: officerTransform,
  CR: crTransform,
  TRR: trrTransform,
  COMMUNITY: areaTransform,
  NEIGHBORHOOD: areaTransform,
  WARD: areaTransform,
  'POLICE-DISTRICT': areaTransform,
  BEAT: areaTransform,
  'SCHOOL-GROUND': areaTransform,
  RANK: rankTransform,
  'INVESTIGATOR > CR': crTransform,
};

export const searchResultItemTransform = (item) => ({
  ...baseItemTransform(item),
  tags: get(item, 'tags', []),
  itemIndex: item.itemIndex || 1,
  isPinned: item.isPinned,
  ...get(previewPaneTransformMap, item.type, () => {})(item),
});
