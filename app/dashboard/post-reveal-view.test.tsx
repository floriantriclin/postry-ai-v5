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

    expect(screen.getByRole("heading", { level: 2, name: "test-theme" })).toBeInTheDocument();
    expect(screen.getByText("Tone: test-archetype")).toBeInTheDocument();
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

  describe("Archetype Fallback Chain", () => {
    it("should use meta.profile.label_final when available (priority 1)", () => {
      const postWithProfileLabel: Post = {
        ...mockPost,
        archetype: "post-archetype",
        equalizer_settings: {
          profile: { label_final: "Profile Label Final" },
          archetype: { name: "Meta Archetype Name" },
        },
      };

      render(<PostRevealView post={postWithProfileLabel} />);

      expect(screen.getByText("Tone: Profile Label Final")).toBeInTheDocument();
    });

    it("should use post.archetype when meta.profile.label_final is missing (priority 2)", () => {
      const postWithArchetypeColumn: Post = {
        ...mockPost,
        archetype: "Post Archetype Column",
        equalizer_settings: {
          archetype: { name: "Meta Archetype Name" },
        },
      };

      render(<PostRevealView post={postWithArchetypeColumn} />);

      expect(screen.getByText("Tone: Post Archetype Column")).toBeInTheDocument();
    });

    it("should use meta.archetype.name when post.archetype is missing (priority 3)", () => {
      const postWithMetaArchetype: Post = {
        ...mockPost,
        archetype: null,
        equalizer_settings: {
          archetype: { name: "Meta Archetype Name" },
        },
      };

      render(<PostRevealView post={postWithMetaArchetype} />);

      expect(screen.getByText("Tone: Meta Archetype Name")).toBeInTheDocument();
    });

    it("should use 'Archetype Inconnu' when all sources are missing (priority 4)", () => {
      const postWithoutArchetype: Post = {
        ...mockPost,
        archetype: null,
        equalizer_settings: null,
      };

      render(<PostRevealView post={postWithoutArchetype} />);

      expect(screen.getByText("Tone: Archetype Inconnu")).toBeInTheDocument();
    });

    it("should prioritize meta.profile.label_final over post.archetype", () => {
      const postWithBoth: Post = {
        ...mockPost,
        archetype: "Post Archetype",
        equalizer_settings: {
          profile: { label_final: "Profile Label" },
        },
      };

      render(<PostRevealView post={postWithBoth} />);

      expect(screen.getByText("Tone: Profile Label")).toBeInTheDocument();
      expect(screen.queryByText("Tone: Post Archetype")).not.toBeInTheDocument();
    });

    it("should prioritize post.archetype over meta.archetype.name", () => {
      const postWithBoth: Post = {
        ...mockPost,
        archetype: "Post Archetype",
        equalizer_settings: {
          archetype: { name: "Meta Archetype" },
        },
      };

      render(<PostRevealView post={postWithBoth} />);

      expect(screen.getByText("Tone: Post Archetype")).toBeInTheDocument();
      expect(screen.queryByText("Tone: Meta Archetype")).not.toBeInTheDocument();
    });
  });
});
