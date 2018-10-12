import { toLower } from 'lodash';

import { extractPercentile } from 'selectors/common/percentile';
import { ACTIVITY_GRID_CARD_TYPES } from 'utils/constants';
import { getVisualTokenOIGBackground } from 'utils/visual-token';
import { getCurrentAge } from 'utils/date';


export const cardTransform = card => {
  if (!card['type']) {
    return officerCardTransform(card);
  } else if (card['type'] === ACTIVITY_GRID_CARD_TYPES.OFFICER) {
    return officerCardTransform(card);
  } else if (card['type'] === ACTIVITY_GRID_CARD_TYPES.PAIR) {
    return pairingCardTransform(card);
  }
};

export const officerCardTransform = card => ({
  id: card['id'],
  officerId: card['id'],
  fullName: card['full_name'],
  complaintCount: card['complaint_count'],
  sustainedCount: card['sustained_count'],
  complaintPercentile: parseFloat(card['complaint_percentile']),
  birthYear: card['birth_year'],
  race: card['race'] ? toLower(card['race']) : 'N/A',
  gender: card['gender'] ? toLower(card['gender']) : 'N/A',
  percentile: extractPercentile(card['percentile']),
  rank: card['rank'],
  type: card['type'],
});

export const simpleOfficerTransform = officer => {
  const percentile = officer.percentile;

  const background = getVisualTokenOIGBackground(
    parseFloat(percentile['percentile_allegation_civilian']),
    parseFloat(percentile['percentile_allegation_internal']),
    parseFloat(percentile['percentile_trr'])
  );

  return {
    id: officer['id'],
    fullName: officer['full_name'],
    age: officer['birth_year'] ? getCurrentAge(officer['birth_year']) : 'N/A',
    race: officer['race'] ? toLower(officer['race']) : 'N/A',
    gender: officer['gender'] ? toLower(officer['gender']) : 'N/A',
    percentile: {
      percentileAllegation: percentile['percentile_allegation'],
      percentileAllegationCivilian: percentile['percentile_allegation_civilian'],
      percentileAllegationInternal: percentile['percentile_allegation_internal'],
      percentileTrr: percentile['percentile_trr'],
    },
    backgroundColor: background.backgroundColor,
  };
};

export const pairingCardTransform = card => ({
  type: card['type'],
  coaccusalCount: card['coaccusal_count'],
  officer1: simpleOfficerTransform(card['officer1']),
  officer2: simpleOfficerTransform(card['officer2'])
});
