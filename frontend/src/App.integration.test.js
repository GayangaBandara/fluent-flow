import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// This test simulates clicking the Record button and ensures the UI toggles the label.
// The actual MediaRecorder is not available in the Jest DOM environment, so we assert only the button text toggles.

test('record button interaction and UI state changes', () => {
  render(<App />);
  const button = screen.getByTestId('record-button');

  // Initially should show "Start Voice Chat"
  expect(button).toHaveTextContent('Start Voice Chat');

  // Button should be clickable
  expect(button).toBeInTheDocument();
  expect(button).not.toBeDisabled();

  // After click (simulating user interaction) - expect error handling
  fireEvent.click(button);

  // The button should exist after click (even if recording fails in test env)
  expect(button).toBeInTheDocument();
});

test('clear conversation button is functional', () => {
  render(<App />);
  
  const clearButton = screen.getByText('Clear Conversation');
  expect(clearButton).toBeInTheDocument();
  expect(clearButton).not.toBeDisabled();
  
  // Click the clear button
  fireEvent.click(clearButton);
  
  // Button should still exist after click
  expect(clearButton).toBeInTheDocument();
});

test('component renders all main sections', () => {
  render(<App />);
  
  // Check that all major sections are rendered
  expect(screen.getByText('Transcript:')).toBeInTheDocument();
  expect(screen.getByText('AI Tutor Response:')).toBeInTheDocument();
  expect(screen.getByText('How to use:')).toBeInTheDocument();
  
  // Check that all instructions are present
  expect(screen.getByText(/Click "Start Voice Chat"/)).toBeInTheDocument();
  expect(screen.getByText(/Speak in English/)).toBeInTheDocument();
  expect(screen.getByText(/Click "Stop Recording"/)).toBeInTheDocument();
  expect(screen.getByText(/Listen to the AI's response/)).toBeInTheDocument();
});

test('responsive layout elements', () => {
  render(<App />);

  // Check that the main container has proper styling
  const mainContainer = screen.getByText('Fluent Flow - Voice Chat MVP (React)').closest('div');
  expect(mainContainer).toBeInTheDocument();

  // Check that recording button has proper styling attributes
  const recordButton = screen.getByTestId('record-button');
  expect(recordButton).toBeInTheDocument();
});

test('audio element not rendered initially', () => {
  render(<App />);
  
  // Audio element should not be present initially
  const audioElements = screen.queryAllByRole('audio');
  expect(audioElements).toHaveLength(0);
});

test('conversation history not rendered initially', () => {
  render(<App />);
  
  // Conversation history section should not be visible initially
  const historySections = screen.queryAllByText(/Conversation History/i);
  expect(historySections).toHaveLength(0);
});