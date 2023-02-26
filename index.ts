import './style.css';

import { Subject } from 'rxjs';

interface Result {
  letters: string[];
  numeric: number[];
}

const appDiv: HTMLElement = document.getElementById('app');

const groups = ['User', 'Group', 'Others'];
const values = ['r', 'w', 'x'];
const template = document.getElementById('select-group');
const numericModeResult = document.getElementById('numberResult');
const stringModeResult = document.getElementById('stringResult');

const form = document.querySelector('form');
const formChange$ = new Subject();
form.onsubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  console.log(formData);
  for (let [name, value] of formData) {
    console.log(`${name} = ${value}`);
  }
};

console.log(template);

function createSelectionGroups() {
  for (let group of groups) {
    const sectionSelect = (<HTMLTemplateElement>template).content.cloneNode(
      true
    );

    for (let attr of values) {
      const li = (<HTMLElement>sectionSelect).querySelector(`[data-${attr}]`);
      const label = li.querySelector('label');
      const input = li.querySelector('input');
      const id = `${group}_${attr}`;
      label.innerText = `${attr}`;
      label.setAttribute('for', id);
      input.setAttribute('name', id);
      input.id = id;
      input.value = `${attr}`;
      input.onchange = (e: Event) => {
        (<HTMLInputElement>e.target).value;
        formChange$.next(true);
      };
    }

    (<HTMLDivElement>sectionSelect).querySelector('.sub-title').innerHTML =
      group;
    form.append(sectionSelect);
  }
}

const letterNumericMap = {
  0: '---',
  1: '--x',
  2: '-w-',
  3: '-wx',
  4: 'r--',
  5: 'r-x',
  6: 'rw-',
  7: 'rwx',
};

class BidirectionalMap<
  V extends string | number,
  K extends string | number,
  T extends Record<K, V>
> {
  fwdMap: Record<K, V>;
  backMap: Record<V, K>;
  constructor(map: T) {
    this.fwdMap = { ...map };
    this.backMap = Object.keys(map).reduce<Record<V, K>>(
      (acc, cur) => {
        const key = map[cur];
        return { ...acc, [key]: cur };
      },
      { ...this.backMap }
    );
  }

  get(key: string | number) {
    return this.fwdMap[key] || this.backMap[key];
  }
}

const letterMap = new BidirectionalMap(letterNumericMap);

formChange$.subscribe(() => {
  const formData = new FormData(form);
  let res = ['-', '-', '-', '-', '-', '-', '-', '-', '-'];
  let inputMap = {
    User_r: 0,
    User_w: 1,
    User_x: 2,
    Group_r: 3,
    Group_w: 4,
    Group_x: 5,
    Others_r: 6,
    Others_w: 7,
    Others_x: 8,
  };
  for (let [name, value] of formData) {
    // console.log(`${name} = ${value}`);
    const index = inputMap[name];
    res[index] = <string>value;
  }
  const stringResult = res.join('');
  const userNum = letterMap.get(stringResult.substring(0, 3));
  const groupNum = letterMap.get(stringResult.substring(3, 6));
  const othersNum = letterMap.get(stringResult.substring(6, 9));
  const numResult = '' + userNum + groupNum + othersNum;
  (<HTMLInputElement>numericModeResult).value = numResult;
  (<HTMLInputElement>stringModeResult).value = stringResult;
});

createSelectionGroups();
