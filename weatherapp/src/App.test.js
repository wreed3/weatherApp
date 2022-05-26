import { render, screen } from '@testing-library/react';
import App from './App';
import Card from '.'

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});


test ('APIKEY is present', () => {

  const expect = "be306616b6cad0ecd57ce6ffa4d8844a";
  const actual = 
  expect(expect).toEqual(actual);

})