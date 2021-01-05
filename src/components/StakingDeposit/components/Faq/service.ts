import { MAIN_QUESTIONS, TEST_QUESTIONS } from './constants';

export const getFaqContent = (networkId) => {
  if(networkId === '1') {
    return MAIN_QUESTIONS;
  }
  else if(networkId === '5') {
    return TEST_QUESTIONS;
  }
  return [];
}