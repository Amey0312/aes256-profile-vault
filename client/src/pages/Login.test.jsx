import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';
import api from '../api';

// Mock the API
vi.mock('../api');

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  
  // CLEANUP: Reset mocks and localStorage after every test
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form correctly', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Use findBy to wait for AuthProvider loading state to finish
    expect(await screen.findByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('updates input values when typing', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for render
    const usernameInput = await screen.findByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('submits form with correct data', async () => {
    // Mock successful login
    api.post.mockResolvedValue({
      data: { access: 'fake-access-token', refresh: 'fake-refresh-token' }
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for render & fill form
    const usernameInput = await screen.findByPlaceholderText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } });

    // Click Submit
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/login/', {
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  it('shows error message on failed login', async () => {
    // Mock failed login
    api.post.mockRejectedValue({
      response: { data: { detail: 'Invalid credentials' } }
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for render & fill form
    const usernameInput = await screen.findByPlaceholderText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'wrongpass' } });
    
    // Click Submit
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

});