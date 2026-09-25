// Prediction store — in-memory history for current session
import { createContext, useContext, useReducer, useCallback } from 'react';

const PredictionContext = createContext();

const initialState = {
  history: JSON.parse(sessionStorage.getItem('riskai_history') || '[]'),
  currentResult: null,
  currentForm: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_RESULT':
      return { ...state, currentResult: action.payload };
    case 'SET_FORM':
      return { ...state, currentForm: action.payload };
    case 'ADD_HISTORY': {
      const updated = [action.payload, ...state.history].slice(0, 100);
      sessionStorage.setItem('riskai_history', JSON.stringify(updated));
      return { ...state, history: updated };
    }
    case 'DELETE_HISTORY': {
      const updated = state.history.filter(h => h.id !== action.payload);
      sessionStorage.setItem('riskai_history', JSON.stringify(updated));
      return { ...state, history: updated };
    }
    case 'CLEAR_HISTORY': {
      sessionStorage.removeItem('riskai_history');
      return { ...state, history: [] };
    }
    default:
      return state;
  }
}

export function PredictionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setResult = useCallback((result) => dispatch({ type: 'SET_RESULT', payload: result }), []);
  const setForm = useCallback((form) => dispatch({ type: 'SET_FORM', payload: form }), []);
  const addToHistory = useCallback((entry) => dispatch({ type: 'ADD_HISTORY', payload: entry }), []);
  const deleteFromHistory = useCallback((id) => dispatch({ type: 'DELETE_HISTORY', payload: id }), []);
  const clearHistory = useCallback(() => dispatch({ type: 'CLEAR_HISTORY' }), []);

  return (
    <PredictionContext.Provider value={{
      ...state, setResult, setForm, addToHistory, deleteFromHistory, clearHistory
    }}>
      {children}
    </PredictionContext.Provider>
  );
}

export const usePrediction = () => {
  const ctx = useContext(PredictionContext);
  if (!ctx) {
    return {
      history: [],
      currentResult: null,
      currentForm: null,
      setResult: () => {},
      setForm: () => {},
      addToHistory: () => {},
      deleteFromHistory: () => {},
      clearHistory: () => {},
    };
  }
  return ctx;
};
