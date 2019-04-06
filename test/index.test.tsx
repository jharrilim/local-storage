import React from 'react';
import { useLocalStorage, writeStorage, deleteFromStorage } from '../src';
import { renderHook, cleanup } from 'react-hooks-testing-library';
import { render, fireEvent, act } from 'react-testing-library';


afterEach(() => {
  cleanup();
})


test('Component can access localStorage value', () => {
  const expectedValue = 'THIS IS SPARTA!';
  const key = 'sparta';

  localStorage.setItem(key, expectedValue);
  const { result } = renderHook(() => useLocalStorage(key));

  expect(localStorage.getItem(key)).toBe(expectedValue);
  expect(result.current[0]).toBe(expectedValue);
});


test('Component should rerender from change to local storage', () => {
  const initialValue = 'No, this is Patrick!';
  const key = 'star';
  const newValue = 'Punch it, Chewie!';
  const testComponentId = 'tcid';
  const testButtonId = 'tbid';

  const Component = () => {
    const [actualValue] = useLocalStorage(key);
    return (
      <span data-testid={testComponentId}>{actualValue}</span>
    );
  };
  const TestButton = () => (
    <button
      onClick={_ => writeStorage(key, newValue)}
      data-testid={testButtonId}
    >Test Button</button>
  );

  writeStorage(key, initialValue);

  const testComponent = render(<Component />);
  const testButton = render(<TestButton />);

  expect(testComponent
    .getByTestId(testComponentId)
    .textContent
  ).toBe(initialValue);

  fireEvent.click(testButton.getByTestId(testButtonId));

  expect(localStorage.getItem(key)).toBe(newValue);
  expect(testComponent
    .getByTestId(testComponentId)
    .textContent
  ).toBe(newValue);
});

test('Hooks use valid types', () => {
  class Foo {
    constructor(public name: string) { }
  }
  const fooId = 'fooP';
  const fooStorageId = 'foo';
  const buttonId = 'btn';
  const buttonDelId = 'btnDel';
  const fooName = 'floofaloof';
  const newFooName = 'gloopalop';

  localStorage.setItem(fooStorageId, JSON.stringify(new Foo(fooName)));

  const TestComponent = () => {
    const [fooString, setFoo, deleteFoo] = useLocalStorage(fooStorageId);

    expect(typeof(fooString) === 'string').toBe(true);

    const fooName = fooString ? (JSON.parse(fooString!) as Foo).name : '';

    return (
      <>
        <p data-testid={fooId}>{fooName}</p>
        <button data-testid={buttonId} onClick={e => setFoo(JSON.stringify(new Foo(newFooName)))}>Clicky Click</button>
        <button data-testid={buttonDelId} onClick={e => deleteFoo()}>Delete Delete</button>
      </>
    );
  }

  const testComponent = render(<TestComponent />);

  expect(testComponent.getByTestId(fooId).textContent).toBe(fooName);

  fireEvent.click(testComponent.getByTestId(buttonId));

  expect(testComponent.getByTestId(fooId).textContent).toBe(newFooName);

  fireEvent.click(testComponent.getByTestId(buttonDelId));

  expect(testComponent.getByTestId(fooId).textContent).toBe("");
});


test('deleteFromStorage removes item from localStorage', () => {
  const key = 'glarp';
  const value = 'glorp';
  localStorage.setItem(key, value);
  deleteFromStorage(key);

  expect(localStorage.getItem(key)).toBe(null);
});


test('deleteFromStorage to trigger update on component', () => {
  const key = 'floot';
  const initialValue = 'larg';
  const testComponentId = 'someId';

  writeStorage(key, initialValue);
  const TestComponent = () => {
    const [value] = useLocalStorage(key);
    return (
      <p data-testid={testComponentId}>{value}</p>
    );
  }
  const testComponent = render(<TestComponent />);
  act(() => deleteFromStorage(key));

  expect(testComponent.getByTestId(testComponentId).textContent).toBe("");
  expect(localStorage.getItem(key)).toBe(null);
});
