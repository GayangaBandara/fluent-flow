import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders Fluent Flow Voice Chat MVP heading', () => {
  render(<App />);
  const heading = screen.getByText(/Fluent Flow - Voice Chat MVP/i);
  expect(heading).toBeInTheDocument();
});

test('renders voice recording controls', () => {
  render(<App />);
  const recordButton = screen.getByTestId('record-button');
  expect(recordButton).toBeInTheDocument();
  expect(recordButton).toHaveTextContent('Start Voice Chat');
});

test('renders clear conversation button', () => {
  render(<App />);
  const clearButton = screen.getByText('Clear Conversation');
  expect(clearButton).toBeInTheDocument();
});

test('displays initial transcript placeholder', () => {
  render(<App />);
  const transcriptSection = screen.getByText('Transcript:');
  expect(transcriptSection).toBeInTheDocument();
  const placeholder = screen.getByText(/No transcript yet.../i);
  expect(placeholder).toBeInTheDocument();
});

test('displays initial AI response placeholder', () => {
  render(<App />);
  const responseSection = screen.getByText('AI Tutor Response:');
  expect(responseSection).toBeInTheDocument();
  const placeholder = screen.getByText(/No response yet.../i);
  expect(placeholder).toBeInTheDocument();
});

test('displays usage instructions', () => {
  render(<App />);
  const howToUse = screen.getByText('How to use:');
  expect(howToUse).toBeInTheDocument();
  
  const instructions = [
    'Click "Start Voice Chat" and allow microphone access',
    'Speak in English (the AI will help with pronunciation and grammar)',
    'Click "Stop Recording" to send your voice to the AI tutor',
    'Listen to the AI\'s response and continue the conversation'
  ];
  
  instructions.forEach(instruction => {
    expect(screen.getByText(instruction)).toBeInTheDocument();
  });
});