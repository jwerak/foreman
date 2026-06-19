import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';

export default class IntegrationTestHelper {
  static flushAllPromises() {
    return new Promise(resolve => setImmediate(resolve));
  }

  constructor(reducers, middlewares = []) {
    this.dispatchSpy = jest.fn(() => ({}));
    const reducerSpy = (state, action) => this.dispatchSpy(action);
    const emptyStore = applyMiddleware(thunk, ...middlewares)(createStore);
    const combinedReducers = combineReducers({
      reducerSpy,
      ...reducers,
    });

    this.store = emptyStore(combinedReducers);
  }

  mount(component) {
    return render(<Provider store={this.store}>{component}</Provider>);
  }

  getState() {
    const state = this.store.getState();
    delete state.reducerSpy;
    return state;
  }

  getDispatchCalls() {
    const isRelevantCall = call =>
      call.filter(({ type }) => type.startsWith('@@redux')).length === 0;

    return this.dispatchSpy.mock.calls.filter(isRelevantCall);
  }

  getLastDispachCall() {
    return this.getDispatchCalls().slice(-1);
  }

  takeStoreSnapshot(description = 'Integration test store') {
    expect(this.getState()).toMatchSnapshot(description);
  }

  takeActionsSnapshot(description = 'Integration test actions') {
    expect(this.getDispatchCalls()).toMatchSnapshot(description);
  }

  takeLastActionSnapshot(description) {
    expect(this.getLastDispachCall()).toMatchSnapshot(description);
  }

  takeStoreAndLastActionSnapshot(description) {
    const state = this.getState();
    const action = this.getLastDispachCall();

    expect({ state, action }).toMatchSnapshot(description);
  }
}
