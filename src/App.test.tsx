// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

beforeEach(() => {
  window.history.replaceState(null, '', '/');
});

afterEach(cleanup);

describe('App', () => {
  it('renders every section', () => {
    render(<App />);
    for (const name of [
      'Palette',
      'Live preview',
      'Color blindness check',
      'Contrast check',
      'Export',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeTruthy();
    }
  });

  it('loads the color from the URL', () => {
    window.history.replaceState(null, '', '/?color=e11d48&name=rose');
    render(<App />);
    expect(screen.getByLabelText<HTMLInputElement>('Hex value').value).toBe('#e11d48');
  });

  it('renders in every vision mode and keeps the real hex labels', () => {
    render(<App />);
    const selector = screen.getByRole('group', { name: 'View as' });

    for (const button of within(selector).getAllByRole('button')) {
      fireEvent.click(button);
      expect(button.getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByRole('button', { name: /your color/ }).textContent).toContain('#2f6fde');
    }
  });

  it('updates the palette from a valid hex but not a partial one', () => {
    render(<App />);
    const input = screen.getByLabelText('Hex value');

    fireEvent.change(input, { target: { value: '#12' } });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('button', { name: /your color/ }).textContent).toContain('#2f6fde');

    fireEvent.change(input, { target: { value: '#15803d' } });
    expect(input.getAttribute('aria-invalid')).toBe('false');
    expect(screen.getByRole('button', { name: /your color/ }).textContent).toContain('#15803d');
  });
});
