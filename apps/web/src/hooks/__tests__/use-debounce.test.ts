import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../use-debounce';
import { vi } from 'vitest';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe retornar el valor inicial inmediatamente', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));

    expect(result.current).toBe('hello');
  });

  it('debe retornar el valor inicial antes del delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } },
    );

    rerender({ value: 'changed', delay: 300 });

    expect(result.current).toBe('initial');
  });

  it('debe actualizar el valor después del delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } },
    );

    rerender({ value: 'changed', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('changed');
  });

  it('debe cancelar el timer anterior si el valor cambia antes del delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 300 } },
    );

    rerender({ value: 'second', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'third', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('third');
  });

  it('debe usar delay por defecto de 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } },
    );

    rerender({ value: 'changed' });

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('changed');
  });

  it('debe funcionar con diferentes tipos de datos', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 42 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(42);
  });

  it('debe funcionar con objetos', () => {
    const initialObj = { name: 'test' };
    const changedObj = { name: 'changed' };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: initialObj } },
    );

    rerender({ value: changedObj });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toEqual({ name: 'changed' });
  });
});
