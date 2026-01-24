import { render, screen, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AuthModal } from "./auth-modal";
import * as auth from "@/lib/auth";

// Mock the auth module
vi.mock("@/lib/auth", () => ({
  signInWithOtp: vi.fn(),
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  X: () => <svg>X</svg>,
}));

const signInWithOtpMock = vi.mocked(auth.signInWithOtp);

describe("AuthModal Component", () => {
  beforeEach(() => {
    signInWithOtpMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

// C2.3.1: Initial Display
it("should display the initial state correctly", () => {
  render(<AuthModal />);
  expect(screen.getByLabelText("Email Address")).not.toBeNull();
  expect(screen.getByRole("button", { name: "Envoyez-moi un lien" })).not.toBeNull();
  expect(screen.queryByText(/lien envoyé/i)).toBeNull();
  expect(screen.queryByText(/required/i)).toBeNull();
});

// C2.3.2: Empty Email Validation
it("should show an error if the form is submitted with an empty email", async () => {
  const user = userEvent.setup();
  const errorMessage = "Adresse email invalide";
  signInWithOtpMock.mockResolvedValue({ success: false, error: { code: 'INVALID_EMAIL', message: errorMessage } });
  
  render(<AuthModal />);
  const submitButton = screen.getByRole("button", { name: "Envoyez-moi un lien" });
  await user.click(submitButton);

  expect(await screen.findByText(errorMessage)).not.toBeNull();
  expect(signInWithOtpMock).not.toHaveBeenCalled();
});

// C2.3.3: Invalid Email Format Validation
it("should show an API error for invalid email format", async () => {
  const user = userEvent.setup();
  const errorMessage = "Adresse email invalide";
  // The mock won't be called because client-side validation catches it first
  signInWithOtpMock.mockResolvedValue({ success: false, error: { code: 'INVALID_EMAIL', message: errorMessage } });
  
  render(<AuthModal />);
  const emailInput = screen.getByLabelText("Email Address");
  const submitButton = screen.getByRole("button", { name: "Envoyez-moi un lien" });

  await user.type(emailInput, "test@");
  await user.click(submitButton);
  
  expect(await screen.findByText(errorMessage)).not.toBeNull();
  expect(signInWithOtpMock).not.toHaveBeenCalled();
});

// C2.3.11: Valid Special Character Email Validation
it("should call signInWithOtp with a valid email containing special characters", async () => {
  const user = userEvent.setup();
  render(<AuthModal />);
  const emailInput = screen.getByLabelText("Email Address");
  const submitButton = screen.getByRole("button", { name: "Envoyez-moi un lien" });
  const validEmail = "test.name+alias@example.co.uk";

  await user.type(emailInput, validEmail);
  await user.click(submitButton);

  await waitFor(() => expect(signInWithOtpMock).toHaveBeenCalledWith(validEmail));
});

// C2.3.4: Loading State
it("should show a loading state during submission", async () => {
  const user = userEvent.setup();
  signInWithOtpMock.mockImplementation(() => new Promise(() => {})); // Never resolves

  render(<AuthModal />);
  const emailInput = screen.getByLabelText("Email Address");
  const submitButton = screen.getByRole("button", { name: "Envoyez-moi un lien" });

  await user.type(emailInput, "test@example.com");
  await user.click(submitButton);

  await waitFor(() => {
    const loadingButton = screen.getByRole("button", { name: "Envoi..." });
    expect(loadingButton).not.toBeNull();
    expect(loadingButton).toHaveProperty("disabled", true);
  });
});

// C2.3.5: Success State
it("should show a success message on successful submission", async () => {
  const user = userEvent.setup();
  signInWithOtpMock.mockResolvedValue({ success: true });

  render(<AuthModal />);
  const emailInput = screen.getByLabelText("Email Address");
  const submitButton = screen.getByRole("button", { name: "Envoyez-moi un lien" });

  await user.type(emailInput, "test@example.com");
  await user.click(submitButton);

  expect(await screen.findByText("Lien envoyé !")).not.toBeNull();
  expect(screen.getByText("Un lien de connexion a été envoyé à votre adresse email. Veuillez consulter votre boîte de réception.")).not.toBeNull();
});

// C2.3.6: API Error State
it("should show an API error message on failed submission", async () => {
  const user = userEvent.setup();
  const errorMessage = "Failed to send link.";
  signInWithOtpMock.mockResolvedValue({ success: false, error: { code: 'UNKNOWN', message: errorMessage } });
  
  render(<AuthModal />);
  const emailInput = screen.getByLabelText("Email Address");
  const submitButton = screen.getByRole("button", { name: "Envoyez-moi un lien" });

  await user.type(emailInput, "test@example.com");
  await user.click(submitButton);

  expect(await screen.findByText(errorMessage)).not.toBeNull();
  const finalSubmitButton = screen.getByRole("button", { name: "Envoyez-moi un lien" });
  expect(finalSubmitButton).not.toBeNull();
  expect(finalSubmitButton).toHaveProperty("disabled", false);
});

// C2.3.7: Accessibility (ARIA Roles)
it('should have role="dialog" on the modal container', () => {
  const { container } = render(<AuthModal />);
  // The component renders two divs with role="dialog" in different states. We check the visible one.
  expect(container.querySelector('[role="dialog"]')).not.toBeNull();
});

// C2.3.8: Accessibility (Focus Trap)
it("should trap focus within the modal", async () => {
  const user = userEvent.setup();
  render(<AuthModal />);
  
  const emailInput = screen.getByLabelText("Email Address");
  const submitButton = screen.getByRole("button", { name: "Envoyez-moi un lien" });

  emailInput.focus();
  expect(emailInput).toHaveFocus();

  // Tab forwards
  await user.tab();
  expect(submitButton).toHaveFocus();

  // Should wrap to the start
  await user.tab();
  expect(emailInput).toHaveFocus();

  // Shift+Tab backwards from the submit button, should wrap to the email input
  await user.tab({ shift: true });
  expect(submitButton).toHaveFocus();
});

// C2.3.12: Pre-Auth Hook Execution
it("should execute onPreAuth before authentication if provided", async () => {
  const user = userEvent.setup();
  const onPreAuthMock = vi.fn().mockResolvedValue(true);
  signInWithOtpMock.mockResolvedValue({ success: true });

  render(<AuthModal onPreAuth={onPreAuthMock} />);
  const emailInput = screen.getByLabelText("Email Address");
  const submitButton = screen.getByRole("button", { name: "Envoyez-moi un lien" });

  await user.type(emailInput, "test@example.com");
  await user.click(submitButton);

  await waitFor(() => {
    expect(onPreAuthMock).toHaveBeenCalledWith("test@example.com");
    expect(signInWithOtpMock).toHaveBeenCalledWith("test@example.com");
  });
});

// C2.3.13: Pre-Auth Hook Failure
it("should stop and show error if onPreAuth fails", async () => {
  const user = userEvent.setup();
  const onPreAuthMock = vi.fn().mockResolvedValue(false);
  signInWithOtpMock.mockResolvedValue({ success: true }); // Should not be called

  render(<AuthModal onPreAuth={onPreAuthMock} />);
  const emailInput = screen.getByLabelText("Email Address");
  const submitButton = screen.getByRole("button", { name: "Envoyez-moi un lien" });

  await user.type(emailInput, "test@example.com");
  await user.click(submitButton);

  await waitFor(() => {
    expect(onPreAuthMock).toHaveBeenCalledWith("test@example.com");
  });
  
  expect(signInWithOtpMock).not.toHaveBeenCalled();
  expect(await screen.findByText("Impossible de sauvegarder votre post. Veuillez réessayer.")).toBeInTheDocument();
});

// C2.3.10 is not applicable as title and description are not props
});
