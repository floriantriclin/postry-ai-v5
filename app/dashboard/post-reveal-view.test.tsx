import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PostRevealView from "./post-reveal-view";
import { Post } from "@/lib/types";

const mockPost: Post = {
  id: "1",
  user_id: "1",
  theme: "test-theme",
  archetype: "test-archetype",
  content: "test-content",
  quiz_answers: [],
  equalizer_settings: null,
  is_revealed: true,
  created_at: new Date().toISOString(),
};

describe("PostRevealView", () => {
  it("should render the post content", () => {
    render(<PostRevealView post={mockPost} />);

    expect(screen.getByText("Theme: test-theme")).toBeInTheDocument();
    expect(screen.getByText("Archetype: test-archetype")).toBeInTheDocument();
    expect(screen.getByText("test-content")).toBeInTheDocument();
  });

  it("TI-2.5-02: should render the loader when post is undefined", () => {
    render(<PostRevealView post={undefined} />);

    expect(screen.getByTestId("loader-machine")).toBeInTheDocument();
  });

  it("TI-2.5-03: should render the empty state when post is null", () => {
    render(<PostRevealView post={null} />);

    expect(screen.getByText("Aucun post généré")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Il semble que vous n'ayez pas encore de post. Complétez le quiz pour en générer un !"
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Retourner au Quiz" })).toHaveAttribute("href", "/quiz");
  });
});
