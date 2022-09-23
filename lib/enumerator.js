/**
 * Author: Jire Lou
 * Created: 09/06/2022
 * Last Modified: 09/06/2022
 * Purpose: Function to create new enum in the form of a class.
 * Returns: Frozen class of type 'enumerator'
**/

module.exports = {
    createEnum: (possibleVals) => {
        return ((_enumeratorVals) => {
            class enumerator {
                // Returns value and key for provided target (val or key)
                constructor(target = undefined) {
                    if (target) return {
                        val: createEnumerator(_enumeratorVals)[target] || -1, 
                        key: createEnumerator(_enumeratorVals)[createEnumerator(_enumeratorVals)[target]] || -1
                    };
                }
            }

            // Creates new enumerator class with current keys and provided keys
            enumerator.addValues = (newVals) => {
                return createEnumerator(_enumeratorVals.concat(newVals));
            }

            //Adds keys to enumerator class
            _enumeratorVals.forEach((_val, i) => {
                enumerator[enumerator[_val] = i] = _val;
            });

            return Object.freeze(enumerator);
        })(possibleVals);
    },
};
