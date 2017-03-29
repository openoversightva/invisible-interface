import { contentSelector } from 'selectors/cr-page';


describe('CR page selectors', function () {
  describe('contentSelector', function () {
    it('should return empty coaccused and complainants array if crid does not exist', function () {
      const state = { crs: {} };
      const props = { crid: 123 };

      contentSelector(state, props).coaccused.should.eql([]);
      contentSelector(state, props).complainants.should.eql([]);
    });

    it('should return list of complainants display string', function () {
      const complainant1 = { race: 'White', gender: 'Male', age: 18 };
      const complainant2 = {};
      const state = { crs: { '123': { complainants: [complainant1, complainant2] } } };
      const props = { crid: 123 };

      contentSelector(state, props).complainants.should.eql([
        'White, Male, Age 18',
        'Unknown, Unknown'
      ]);
    });

    it('should return list of coaccused', function () {
      const coaccusedObj = {
        'id': 1, 'full_name': 'Michel Foo', 'gender': 'Male', 'race': 'White', 'final_finding': 'Sustained',
        'recc_outcome': 'Reprimand', 'final_outcome': 'Reprimand', 'start_date': '2012-02-01',
        'end_date': '2013-02-01', 'category': 'Operations/Personnel Violation',
        'subcategory': 'Neglect of duty/conduct unbecoming - on duty' };
      const state = { crs: { '123': { coaccused: [coaccusedObj] } } };
      const props = { crid: 123 };

      contentSelector(state, props).coaccused.should.eql([{
        id: 1,
        fullName: 'Michel Foo',
        gender: 'Male',
        race: 'White',
        finalFinding: 'Sustained',
        reccOutcome: 'Reprimand',
        finalOutcome: 'Reprimand',
        startDate: '2012-02-01',
        endDate: '2013-02-01',
        category: 'Operations/Personnel Violation',
        subcategory: 'Neglect of duty/conduct unbecoming - on duty'
      }]);
    });

    it('should set coaccused gender, race, finalFinding, finalOutcome, '
        + 'reccOutcome, category, subcategory to Unknown if missing data', function () {
      const coaccusedObj = { 'id': 1, 'full_name': 'Michel Foo', 'start_date': '2012-02-01', 'end_date': '2013-02-01' };
      const state = { crs: { '123': { coaccused: [coaccusedObj] } } };
      const props = { crid: 123 };

      contentSelector(state, props).coaccused.should.eql([{
        id: 1,
        fullName: 'Michel Foo',
        gender: 'Unknown',
        race: 'Unknown',
        finalFinding: 'Unknown',
        reccOutcome: 'Unknown',
        finalOutcome: 'Unknown',
        startDate: '2012-02-01',
        endDate: '2013-02-01',
        category: 'Unknown',
        subcategory: 'Unknown'
      }]);
    });
  });
});
