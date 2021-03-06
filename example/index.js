import Observable from 'observable-proxy';

const observable = new Observable({});

const disposeGlobal = Observable.observe(observable,
    (key, newValue, oldValue) => { // observe all key changes in object
        console.log(`All key observer, key '${key}' value changed from '${oldValue}' to '${newValue}'.`);
    }
);


const disposeSome = Observable.observe(observable, 'some',
    (key, newValue, oldValue) => { // observe 'some' key changes in object
        console.log(`'some' key observer, value changed from '${oldValue}' to '${newValue}'.`);
    }
);

//...

observable.a = 5;
// All key observer, key 'a' value changed from 'undefined' to '5'.

observable.a = 6;
// All key observer, key 'a' value changed from '5' to '6'.

observable.some = 'value';
// All key observer, key 'some' value changed from 'undefined' to 'value'.
// 'some' key observer, value changed from 'undefined' to 'value'.

observable.some = 'other value';
// All key observer, key 'some' value changed from 'value' to 'other value'.
// 'some' key observer, value changed from 'value' to 'other value'.

delete observable.a;
// All key observer, key 'a' value changed from '6' to 'undefined'.

//...

disposeGlobal(); // stops the first observer watching for all key changes

delete observable.some;
// 'some' key observer, value changed from 'other value' to 'undefined'.

disposeSome(); // stops the second observer watching for 'some' key changes

//...
