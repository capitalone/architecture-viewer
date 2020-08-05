import validator from '../src/utils/dataValidator';


//The given example files for users to test out themselves
const base_dir = '../sample_json_data/'

const simple_structure = require(base_dir + 'simple_structure.json');
const section_example = require(base_dir + 'section_example.json');
const readme_example = require(base_dir + 'readme_example.json');
const zones_example = require(base_dir + 'zones_example.json');
const large_web = require(base_dir + 'large_web.json');

const printErrors = (res) => {
    if (res.errors) {
        console.error(errors);
    }
}

expect.extend({
    toNotError(received, argument) {
        const res = validator(received);
        const pass = res.errors.length === 0;
        if (pass) {
            return {
                message: () => (`${received} is a valid json structure`),
                pass: true
            }
        } else {
            return {
                message: () => (`an error occurred in validation, here it is: \n${JSON.stringify(res.errors, null, 4)}`),
                pass: false
            }
        }
    }
})

describe('validator', () => {
    /*
        THE GIVEN JSON FILES IN THE sample_json_data DIRECTORY
    */
    it('should validate a simple diagram', () => {
        expect(simple_structure).toNotError();
    });

    it('should validate a diagram with groups', () => {
        expect(section_example).toNotError();
    })

    it('should validate the readme example', () => {
        expect(readme_example).toNotError();
    })

    it('should validate the zones example', () => {
        expect(zones_example).toNotError();
    })

    it('should validate the large web example', () => {
        expect(large_web).toNotError();
    })



});