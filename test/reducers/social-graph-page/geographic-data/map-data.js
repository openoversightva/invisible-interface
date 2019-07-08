import mapData from 'reducers/social-graph-page/geographic-data/map-data';
import { SOCIAL_GRAPH_GEOGRAPHIC_REQUEST_SUCCESS } from 'utils/constants';


describe('mapData reducer', function () {
  it('should have initial state', function () {
    mapData(undefined, {}).should.eql([]);
  });

  it('should handle SOCIAL_GRAPH_GEOGRAPHIC_REQUEST_SUCCESS', function () {
    mapData([], {
      type: SOCIAL_GRAPH_GEOGRAPHIC_REQUEST_SUCCESS,
      payload: [
        {
          'date': '2007-04-25',
          'crid': '123456',
          'category': 'Use Of Force',
          'coaccused': 3,
          'kind': 'CR',
          'point': {
            'lon': -87,
            'lat': 35
          },
        }
      ]
    }).should.eql([
      {
        'date': '2007-04-25',
        'crid': '123456',
        'category': 'Use Of Force',
        'coaccused': 3,
        'kind': 'CR',
        'point': {
          'lon': -87,
          'lat': 35
        },
      }
    ]);
  });
});
